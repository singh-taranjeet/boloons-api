import { Injectable } from '@nestjs/common';
import { GameConstants, RedisKeys } from '../utils/constants';
import { RedisService } from 'src/redis/redis.service';
import { GameFamily, GameStep, GameType } from 'src/utils/schemas/types';
import {
  generateRedisGameSessionKey,
  generateRedisKeyPlayerSocket,
  generateRedisKeySocketPlayer,
  generateRedisKeyPlayersList,
  generateRedisKeyPlayerData,
} from './methods';

@Injectable()
export class GameCacheService {
  constructor(private readonly redisService: RedisService) {}

  async createGameCache(params: {
    type: GameType;
    family: GameFamily;
    gameId: string;
  }) {
    const { type, family, gameId } = params;

    await this.createGameSession({
      key: gameId,
      payload: {
        type,
        family,
        step: GameConstants.step.Waitingplayers,
      },
    });
  }

  private async createGameSession(params: {
    key: string;
    payload: {
      type: GameType;
      family: GameFamily;
      step: GameStep;
    };
  }) {
    const { key, payload } = params;

    const gameKey = generateRedisGameSessionKey(key);

    this.redisService.redisClient().hSet(gameKey, payload);
    this.redisService.redisClient().expire(gameKey, 5 * 60);

    const playersKey = generateRedisKeyPlayersList(key);
    this.redisService.redisClient().expire(playersKey, 5 * 60);
  }

  async updateGameStep(gameId: string, step: GameStep) {
    const key = generateRedisGameSessionKey(gameId);
    await this.redisService.redisClient().hSet(key, {
      step,
    });
  }

  async deleteGame(gameId: string) {
    await this.redisService
      .redisClient()
      .del(generateRedisGameSessionKey(gameId));
  }

  async isGameWaiting(gameId: string) {
    const step = await this.redisService
      .redisClient()
      .hGet(generateRedisGameSessionKey(gameId), 'step');
    if (step === GameConstants.step.Waitingplayers) {
      return true;
    }
    return false;
  }

  async loginUser(playerId: string, socketId: string) {
    const playerKey = generateRedisKeySocketPlayer(playerId);
    this.redisService.redisClient().hSet(playerKey, { id: socketId });

    const key = generateRedisKeyPlayerSocket(socketId);
    this.redisService.redisClient().hSet(key, { id: playerId });

    this.redisService.redisClient().sAdd(RedisKeys.usersOnline, socketId);
  }

  async logoutUser(socketId: string) {
    const key = generateRedisKeyPlayerSocket(socketId);
    const playerId = await this.redisService.redisClient().hGet(key, 'id');
    const key2 = generateRedisKeySocketPlayer(playerId);
    await this.redisService.redisClient().del(key);
    await this.redisService.redisClient().del(key2);
    this.redisService.redisClient().sRem(RedisKeys.usersOnline, socketId);
  }

  async isPlayerOnline(playerId: string) {
    const playerKey = generateRedisKeySocketPlayer(playerId);
    const player = await this.redisService.redisClient().hGet(playerKey, 'id');
    return player;
  }

  async addPlayerToGameList(playerId: string, gameId: string) {
    const playersKey = generateRedisKeyPlayersList(gameId);
    await this.redisService.redisClient().sAdd(playersKey, playerId);
  }

  async isPlayerInGameList(playerId: string, gameId: string) {
    return this.redisService
      .redisClient()
      .sIsMember(generateRedisKeyPlayersList(gameId), playerId);
  }

  async createPlayerData(playerId: string, playerName: string, gameId: string) {
    const key = generateRedisKeyPlayerData(playerId, gameId);
    await this.redisService.redisClient().hSet(key, {
      name: playerName,
      score: 0,
    });
  }

  async getplayersOfGame(gameId: string) {
    const playersKey = generateRedisKeyPlayersList(gameId);
    const players = await this.redisService.redisClient().sMembers(playersKey);

    const onlinePlayers = [];
    for (let i = 0; i < players.length; i++) {
      const playerKey = generateRedisKeyPlayerData(players[i], gameId);
      const data = await this.redisService.redisClient().hGetAll(playerKey);
      onlinePlayers.push(data);
    }
    return onlinePlayers;
  }
  /**
   * Add player to game sesion
   */
  async addPlayerToGame(body: {
    gameId: string;
    name: string;
    playerId: string;
  }) {
    const { gameId, name = '', playerId } = body;

    console.log('New request to join');

    const isPlayerOnline = await this.isPlayerOnline(playerId);

    // check if this session exist and is waiting for players
    const isGameWaiting = this.isGameWaiting(gameId);

    const alreadyJoined = await this.isPlayerInGameList(playerId, gameId);

    // If the game has not started and player not joined already
    if (isGameWaiting && !alreadyJoined) {
      // add this player to players list of this game
      await this.addPlayerToGameList(playerId, gameId);

      // Create data of this player
      await this.createPlayerData(playerId, name, gameId);
      const players = await this.getplayersOfGame(gameId);
      return players;
    }
    return false;
  }

  async updatePlayerScore(playerId: string, gameId: string, score: number) {
    const isPlayerInGameList = await this.isPlayerInGameList(playerId, gameId);
    if (isPlayerInGameList) {
      const key = generateRedisKeyPlayerData(playerId, gameId);
      await this.redisService.redisClient().hSet(key, {
        score,
      });
    }
  }
}

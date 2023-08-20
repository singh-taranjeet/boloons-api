import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { REDIS_CLIENT, RedisClient } from './redis-client.type';
import { GameFamily, GameStep, GameType } from 'src/utils/schemas/types';
import {
  generateRedisGameSessionKey,
  generateRedisKeyPlayerData,
  generateRedisKeyPlayersList,
  generateRedisKeySocketPlayer,
} from 'src/game/methods';

@Injectable()
export class RedisService implements OnModuleDestroy {
  public constructor(
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
  ) {}

  onModuleDestroy() {
    this.redis.quit();
  }

  ping() {
    return this.redis.ping();
  }

  async createGameSession(params: {
    key: string;
    payload: {
      type: GameType;
      family: GameFamily;
      step: GameStep;
    };
  }) {
    const { key, payload } = params;

    const gameKey = generateRedisGameSessionKey(key);

    this.redis.hSet(gameKey, payload);
    this.redis.expire(gameKey, 5 * 60);

    const playersKey = generateRedisKeyPlayersList(key);
    this.redis.expire(playersKey, 5 * 60);
  }

  async isPlayerOnline(playerId: string) {
    const playerKey = generateRedisKeySocketPlayer(playerId);
    const player = await this.redis.hGet(playerKey, 'id');

    return player;
  }

  async getplayersOfGame(gameId: string) {
    const playersKey = generateRedisKeyPlayersList(gameId);
    const players = await this.redis.sMembers(playersKey);

    const onlinePlayers = [];
    for (let i = 0; i < players.length; i++) {
      const playerKey = generateRedisKeyPlayerData(players[i], gameId);
      const data = await this.redis.hGetAll(playerKey);
      onlinePlayers.push(data);
    }
    return onlinePlayers;
  }

  public redisClient() {
    return this.redis;
  }
}

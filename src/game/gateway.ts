import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server } from 'socket.io';
import { GameService } from './game.service';
import { GameConstants, RedisKeys } from 'src/utils/constants';
import { RedisService } from 'src/redis/redis.service';
import {
  generateRedisGameSessionKey,
  generateRedisKeyPlayerData,
  generateRedisKeyPlayersList,
  generateRedisKeyPlayerSocket,
  generateRedisKeySocketPlayer,
} from './methods';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnModuleInit {
  constructor(
    private readonly GameService: GameService,
    private readonly redisService: RedisService,
  ) {
    this.gameSession = {};
  }
  @WebSocketServer()
  server: Server;

  gameSession: {
    [id: string]: {
      inProgress: boolean;
      players: {
        [id: string]: {
          name?: string;
          score?: number;
        };
      };
    };
  };

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('Socket id', socket.id);

      const socketId = `${socket.id}`;

      socket.on('login', async (params: { id: string }) => {
        const { id } = params;

        const playerKey = generateRedisKeySocketPlayer(id);
        this.redisService.redisClient().hSet(playerKey, { id: socketId });

        const key = generateRedisKeyPlayerSocket(socketId);
        this.redisService.redisClient().hSet(key, { id });

        this.redisService.redisClient().sAdd(RedisKeys.usersOnline, socketId);
        console.log('done');
      });

      socket.on('disconnect', async () => {
        const key = generateRedisKeyPlayerSocket(socketId);
        const playerId = await this.redisService.redisClient().hGet(key, 'id');

        const key2 = generateRedisKeySocketPlayer(playerId);
        await this.redisService.redisClient().del(key);
        await this.redisService.redisClient().del(key2);
        this.redisService.redisClient().sRem(RedisKeys.usersOnline, socketId);
      });
    });
  }

  private getPlayers(gameId: string) {
    return Object.keys(this.gameSession[gameId].players).map((key) => {
      return {
        id: key,
        name: this.gameSession[gameId].players[key].name,
        score: this.gameSession[gameId].players[key].score,
      };
    });
  }

  @SubscribeMessage('createSession')
  async onNewGameSession(
    @MessageBody() body: { gameId: string; playerId: string; name: string },
  ) {
    const { gameId, playerId, name } = body;
    this.gameSession[gameId] = {
      players: {
        [playerId]: {
          name,
        },
      },
      inProgress: false,
    };

    //this.GameService.createGame(gameId);
  }

  @SubscribeMessage('playerJoined')
  async onplayerJoin(
    @MessageBody() body: { gameId: string; name: string; playerId: string },
  ) {
    const { gameId, name, playerId } = body;
    console.log('new request for player to join');

    const isPlayerOnline = await this.redisService.isPlayerOnline(playerId);

    // check if this session exist and is waiting for players
    const key = generateRedisGameSessionKey(gameId);
    const gameStep = await this.redisService.redisClient().hGet(key, 'step');
    const playersKey = generateRedisKeyPlayersList(gameId);
    const alreadyJoined = await this.redisService
      .redisClient()
      .sIsMember(playersKey, playerId);
    console.log('Already joined', alreadyJoined, gameStep, isPlayerOnline);
    // If the game has not started and player not joined already
    if (
      gameStep &&
      gameStep === GameConstants.step.Waitingplayers &&
      !alreadyJoined &&
      isPlayerOnline
    ) {
      const playerKey = generateRedisKeyPlayerData(playerId, gameId);
      await this.redisService.redisClient().hSet(playerKey, {
        name: name || '',
        score: 0,
      });
      const players = await this.redisService.getplayersOfGame(gameId);
      console.log('Players in this game session', players);
      // send a message to the session that player has joined
      this.server.emit(gameId, {
        type: 'PlayerjoinedMsg',
        players,
      });
    }
  }

  @SubscribeMessage('gameStarted')
  onGameStart(@MessageBody() body: { gameId: string }) {
    const { gameId } = body;
    console.log(`${gameId} Game session has been started`);
    // Check if this player already exist
    if (this.gameSession[gameId]) {
      this.gameSession[gameId].inProgress = true;
      // send a message to the session that player has joined
      this.server.emit(gameId, {
        type: 'GameStartedMsg',
        gameId,
      });
      // set in progress true
      this.GameService.deleteGame(gameId);
    }
  }

  @SubscribeMessage('gameScored')
  onGameScore(
    @MessageBody() body: { gameId: string; playerId: string; score: number },
  ) {
    const { gameId, playerId, score } = body;
    console.log(`${body.gameId} PlayerId has scored`);

    if (this.gameSession[gameId] && this.gameSession[gameId].inProgress) {
      this.gameSession[gameId].players[playerId].score = score;

      this.server.emit(gameId, {
        type: 'GameScoredMsg',
        players: this.getPlayers(gameId),
      });
    }
  }
}

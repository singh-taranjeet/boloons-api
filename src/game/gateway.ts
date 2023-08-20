import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server } from 'socket.io';
import { Events, GameConstants } from 'src/utils/constants';
import { GameCacheService } from './game-cache.service';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnModuleInit {
  constructor(private readonly gameCacheService: GameCacheService) {
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
    this.server.on(Events.connect.connection, (socket) => {
      console.log('Socket id', socket.id);

      const socketId = `${socket.id}`;

      // On Login
      socket.on(Events.connect.login, async (params: { id: string }) => {
        const { id } = params;
        await this.gameCacheService.loginUser(id, socketId);
      });

      // On Disconnect
      socket.on(Events.connect.disconnect, async () => {
        await this.gameCacheService.logoutUser(socketId);
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

  @SubscribeMessage(Events.game.gameStarted)
  async onGameStart(@MessageBody() body: { gameId: string }) {
    const { gameId } = body;

    const isGameWaiting = this.gameCacheService.isGameWaiting(gameId);
    if (isGameWaiting) {
      await this.gameCacheService.updateGameStep(
        gameId,
        GameConstants.step.Started,
      );
      this.server.emit(gameId, {
        type: Events.game.gameStarted,
        gameId,
      });
    }
  }

  @SubscribeMessage(Events.game.gameScored)
  async onGameScore(
    @MessageBody() body: { gameId: string; playerId: string; score: number },
  ) {
    const { gameId, playerId, score } = body;

    await this.gameCacheService.updatePlayerScore(playerId, gameId, score);

    this.server.emit(gameId, {
      type: 'GameScoredMsg',
      players: this.getPlayers(gameId),
    });
  }

  serverInstance() {
    return this.server;
  }
}

// import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server } from 'socket.io';
import { Events, GameConstants } from './utils/constants';
import { GameCacheService } from './game-cache.service';
import { GameEventMessageType } from 'src/game/utils/types';

@WebSocketGateway({ cors: true })
export class GameGateway {
  constructor(private readonly gameCacheService: GameCacheService) {}
  @WebSocketServer()
  server: Server;

  // onModuleInit() {
  //   this.server.on(Events.connect.connection, (socket) => {
  //     console.log('Socket id', socket.id);

  //     // const socketId = `${socket.id}`;

  //     // // On Login
  //     // socket.on(Events.connect.login, async (params: { id: string }) => {
  //     //   const { id } = params;
  //     //   await this.gameCacheService.loginUser(id, socketId);
  //     // });

  //     // // On Disconnect
  //     // socket.on(Events.connect.disconnect, async () => {
  //     //   await this.gameCacheService.logoutUser(socketId);
  //     // });
  //   });
  // }

  @SubscribeMessage(Events.game.events.gameStarted)
  async onGameStart(@MessageBody() body: { gameId: string }) {
    const { gameId } = body;

    const isGameWaiting = this.gameCacheService.checkGameStep(gameId);
    if (isGameWaiting) {
      await this.gameCacheService.updateGameStep(
        gameId,
        GameConstants.step.Started,
      );
      this.server.emit(gameId, {
        type: Events.game.eventMessageType.gameStartedMsg,
        gameId,
      });
    }
  }

  @SubscribeMessage(Events.game.events.gameScored)
  async onGameScore(
    @MessageBody() body: { gameId: string; playerId: string; score: number },
  ) {
    const { gameId, playerId, score } = body;

    // Stop this game if the score is greater than 1
    if (score > 0) {
      await this.gameCacheService.updateGameStep(
        gameId,
        GameConstants.step.Stopped,
      );
    }

    await this.gameCacheService.updatePlayerScore(playerId, gameId, score);
    const players = await this.gameCacheService.getplayersOfGame(gameId);

    this.server.emit(gameId, {
      type: Events.game.eventMessageType.gameScoredMsg,
      players,
    });
  }

  emit<PayloadType>(
    gameId: string,
    type: GameEventMessageType,
    payload: PayloadType,
  ) {
    this.server.emit(gameId, {
      type,
      payload,
    });
  }
}

import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
  },
})
export class GameGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;
  gameSession: {
    [id: string]: {
      name: string;
      inProgress: boolean;
      players: {
        [id: string]: {
          name?: string;
          score?: number;
        };
      };
    };
  };

  constructor() {
    this.gameSession = {};
  }

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('Socket id', socket.id);
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
  onNewGameSession(@MessageBody() body: { gameId: string; name: string }) {
    const { gameId, name = '' } = body;
    this.gameSession[gameId] = {
      name,
      players: {},
      inProgress: false,
    };
    console.log('created a new session', this.gameSession[gameId]);
  }

  @SubscribeMessage('playerJoined')
  onplayerJoin(
    @MessageBody() body: { gameId: string; name: string; playerId: string },
  ) {
    const { gameId, name, playerId } = body;
    console.log('new request for player to join');
    // Check if this player already exist
    const exist = this.gameSession[gameId];
    if (exist) {
      this.gameSession[gameId].players[playerId] = {
        name: name || '',
        score: 0,
      };
      // send a message to the session that player has joined
      this.server.emit(gameId, {
        type: 'PlayerjoinedMsg',
        players: this.getPlayers(gameId),
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

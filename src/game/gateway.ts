import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnModuleInit {
  constructor(private readonly GameService: GameService) {
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

    this.GameService.createGame(gameId);
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

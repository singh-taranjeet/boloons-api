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

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('Socket id', socket.id);
    });
  }

  @SubscribeMessage('gameSession')
  onNewGameSession(@MessageBody() body: any) {
    console.log('Body', body);
    this.server.emit(body.channel, {
      msg: body.message,
    });
  }

  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() body: any) {
    console.log('Body', body);
    this.server.emit('newMessage', {
      hello: 'taranjeetsingh',
    });
  }
}

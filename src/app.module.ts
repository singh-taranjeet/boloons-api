import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayModule } from './gateway/gateway.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    GatewayModule,
    GameModule,
    MongooseModule.forRoot(
      'mongodb+srv://test:test@games.lpv5yy8.mongodb.net/?retryWrites=true&w=majority',
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

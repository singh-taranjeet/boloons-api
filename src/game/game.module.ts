import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { Game, GameSchema } from '../utils/schemas/game.schema';
import { GameGateway } from './gateway';
import { RedisModule } from 'src/redis/redis.module';
import { GameCacheService } from './game-cache.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
    RedisModule,
  ],
  controllers: [GameController],
  providers: [GameService, GameGateway, GameCacheService],
})
export class GameModule {}

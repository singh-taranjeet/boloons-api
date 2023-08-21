import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { Game, GameSchema } from './utils/schemas/game.schema';
import { GameGateway } from './gateway';
import { RedisModule } from 'src/redis/redis.module';
import { GameCacheService } from './game-cache.service';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { Player, PlayerSchema } from './utils/schemas/player.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    RedisModule,
  ],
  controllers: [GameController, PlayerController],
  providers: [GameService, GameGateway, GameCacheService, PlayerService],
})
export class GameModule {}

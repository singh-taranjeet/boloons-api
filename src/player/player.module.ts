import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Player, PlayerSchema } from 'src/utils/schemas/player.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
  ],
  controllers: [PlayerController],
  providers: [PlayerService],
})
export class PlayerModule {}

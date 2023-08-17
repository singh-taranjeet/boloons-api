import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player } from 'src/utils/schemas/player.schema';

@Injectable()
export class PlayerService {
  constructor(@InjectModel(Player.name) private PlayerModel: Model<Player>) {}

  async createPlayer(name: string) {
    const newPlayer = new this.PlayerModel({ name });
    await newPlayer.save();
    return newPlayer._id;
  }

  async updatePlayerName(name: string, id: string) {
    const player = await this.PlayerModel.findOneAndUpdate(
      { _id: id },
      { name },
    ).exec();
    return player._id;
  }
}

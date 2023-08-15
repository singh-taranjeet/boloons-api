import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Game } from './schemas/game.schema';
import { InjectModel } from '@nestjs/mongoose';
import { AppConstants } from '../utils/constants';

@Injectable()
export class GameService {
  constructor(@InjectModel(Game.name) private GameModel: Model<Game>) {}

  async createGame(gameId: string) {
    const createdGame = new this.GameModel({ gameId, inProgress: false });
    await createdGame.save();
    return AppConstants.response.successResponse(createdGame);
  }

  async updateGame(
    gameId: string,
    inProgress: boolean,
  ): Promise<{ success: boolean }> {
    const game = await this.GameModel.findOneAndUpdate(
      { gameId },
      { inProgress },
    ).exec();

    if (game) {
      return AppConstants.response.successResponse();
    }

    throw new NotFoundException();
  }

  async deleteGame(gameId: string) {
    const game = await this.GameModel.findOneAndDelete({ gameId }).exec();

    if (game) {
      return AppConstants.response.successResponse();
    }

    throw new NotFoundException();
  }

  async getAllGames(): Promise<Game[]> {
    return this.GameModel.find().exec();
  }

  async addPlayer(id: string, name: string, gameId: string): Promise<any> {
    const newPlayer = {
      id,
      name,
      score: 0,
    };

    const updated = await this.GameModel.findOneAndUpdate(
      { gameId, inProgress: false },
      {
        $push: { players: newPlayer },
      },
      {
        fields: ['_id'],
      },
    ).exec();

    console.log('updated', updated);

    if (updated) {
      return AppConstants.response.successResponse();
    }

    throw new NotFoundException();
  }

  async getGame(params: { gameId: string }) {
    const { gameId } = params;
    const game = await this.GameModel.findOne({ gameId }, { inProgress: 1 });
    console.log('game', game);
    if (game) {
      return AppConstants.response.successResponse(game);
    }

    throw new NotFoundException();
  }
}

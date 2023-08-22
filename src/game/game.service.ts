import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Game } from './utils/schemas/game.schema';
import { InjectModel } from '@nestjs/mongoose';
import { GameConstants } from './utils/constants';
import { CreateGameDto } from './dto/create-game.dto/create-game.dto';
import { GameStep } from 'src/game/utils/types';
import { GameCacheService } from './game-cache.service';
import { AppConstants } from 'src/utils/constants';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name) private GameModel: Model<Game>,
    private readonly gameCacheService: GameCacheService,
  ) {}

  async createGame(createGameDto: CreateGameDto) {
    const { type, family } = createGameDto;
    // Create Record on Mongo
    const createdGame = new this.GameModel({
      type,
      family,
      step: GameConstants.step.Waitingplayers,
    });
    await createdGame.save();
    const gameId = `${createdGame._id}`;

    await this.gameCacheService.createGameCache({
      type,
      family,
      gameId,
    });
    return AppConstants.response.successResponse(gameId);
  }

  async updateGameStep(
    gameId: string,
    step: GameStep,
  ): Promise<{ success: boolean }> {
    const game = await this.GameModel.findOneAndUpdate(
      { _id: gameId },
      { step },
    ).exec();

    if (game) {
      await this.gameCacheService.updateGameStep(gameId, step);
      return AppConstants.response.successResponse();
    }

    throw new NotFoundException();
  }

  async deleteGame(gameId: string) {
    const game = await this.GameModel.findOneAndDelete({ gameId }).exec();

    if (game) {
      await this.gameCacheService.deleteGame(gameId);
      return AppConstants.response.successResponse();
    }

    throw new NotFoundException();
  }

  async getAllGames() {
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

  async getGame(params: { gameId: string; gameStep: GameStep }) {
    const { gameId, gameStep } = params;
    const isGameWaiting = await this.gameCacheService.isGameWaiting(
      gameId,
      gameStep,
    );

    console.log('is waiting', isGameWaiting);

    if (isGameWaiting) {
      return AppConstants.response.successResponse();
    }

    throw new NotFoundException();
  }
}

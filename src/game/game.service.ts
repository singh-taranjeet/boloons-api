import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Game } from '../utils/schemas/game.schema';
import { InjectModel } from '@nestjs/mongoose';
import { AppConstants, GameConstants } from '../utils/constants';
import { RedisService } from 'src/redis/redis.service';
import { CreateGameDto } from './dto/create-game.dto/create-game.dto';
import { generateRedisGameSessionKey } from './methods';
import { GameStep } from 'src/utils/schemas/types';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name) private GameModel: Model<Game>,
    private readonly redisService: RedisService,
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
    const key = generateRedisGameSessionKey(gameId);
    this.redisService.createHash({
      key,
      payload: {
        type,
        family,
        step: createdGame.step,
      },
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
      const key = generateRedisGameSessionKey(gameId);
      await this.redisService.redisClient().hSet(key, {
        step: step,
      });
      return AppConstants.response.successResponse();
    }

    throw new NotFoundException();
  }

  async deleteGame(gameId: string) {
    const game = await this.GameModel.findOneAndDelete({ gameId }).exec();

    if (game) {
      this.redisService.redisClient().del(generateRedisGameSessionKey(gameId));
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

  async getGame(params: { gameId: string }) {
    const { gameId } = params;
    const game = await this.GameModel.findOne(
      { gameId },
      { inProgress: 1, _id: false },
    ).exec();
    console.log('game', game, gameId);
    if (game) {
      return AppConstants.response.successResponse(game);
    }

    throw new NotFoundException();
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto/update-game.dto';
import { GameStep } from './utils/types';
import { AppConstants } from 'src/utils/constants';

@Controller('game')
export class GameController {
  constructor(private readonly GameService: GameService) {}

  @Get()
  getAllGames() {
    return this.GameService.getAllGames();
  }

  @Get('/:gameId')
  async getGame(@Param('gameId') gameId: string) {
    const game = await this.GameService.getGame(gameId);
    if (game) {
      return AppConstants.response.successResponse(game);
    }
    throw new BadRequestException();
  }

  @Get('/:gameId/:gameStep')
  async checkGameStep(
    @Param('gameId') gameId: string,
    @Param('gameStep') gameStep: GameStep,
  ) {
    const isCorrectStep = await this.GameService.checkGameStep({
      gameId,
      gameStep,
    });
    if (isCorrectStep) {
      return AppConstants.response.successResponse();
    }
    throw new BadRequestException();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createGame: CreateGameDto) {
    return this.GameService.createGame(createGame);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  updateGameStep(@Body() params: UpdateGameDto) {
    const { gameId, step } = params;
    return this.GameService.updateGameStep(gameId, step);
  }
}

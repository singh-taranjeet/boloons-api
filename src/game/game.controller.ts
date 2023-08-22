import {
  Body,
  Controller,
  Delete,
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
import { StopGameDto } from './dto/stop-game.dto/stop-game.dto';
import { GameStep } from './utils/types';

@Controller('game')
export class GameController {
  constructor(private readonly GameService: GameService) {}

  @Get()
  getAllGames() {
    return this.GameService.getAllGames();
  }

  @Get('/:gameId/:gameStep')
  //@Get(':gameStep')
  getGame(
    @Param('gameId') gameId: string,
    @Param('gameStep') gameStep: GameStep,
  ) {
    return this.GameService.getGame({ gameId, gameStep });
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

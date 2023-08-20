import {
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
import { GameFamily, GameStep, GameType } from 'src/utils/schemas/types';
import { UpdateGameDto } from './dto/update-game.dto/update-game.dto';

@Controller('game')
export class GameController {
  constructor(private readonly GameService: GameService) {}

  @Get()
  getAllGames() {
    return this.GameService.getAllGames();
  }

  @Get(':id')
  getGame(@Param('id') gameId: string) {
    return this.GameService.getGame({ gameId });
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

  // @Delete()
  // @HttpCode(HttpStatus.OK)
  // deleteGame(@Body() DeleteGameDto: CreateGameDto) {
  //   const { gameId } = DeleteGameDto;
  //   return this.GameService.deleteGame(gameId);
  // }

  // @Post('/player')
  // @HttpCode(HttpStatus.CREATED)
  // AddPlayer(@Body() addPlayerDto: AddPlayerDto) {
  //   const { id, gameId, name } = addPlayerDto;
  //   return this.GameService.addPlayer(id, name, gameId);
  // }
}

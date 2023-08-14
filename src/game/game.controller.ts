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
import { UpdateGameDto } from './dto/update-game.dto/update-game.dto';
import { AddPlayerDto } from './dto/add-player.dto/add-player.dto';

@Controller('game')
export class GameController {
  constructor(private readonly GameService: GameService) {}

  @Get()
  getAllGames() {
    return this.GameService.getAllGames();
  }

  @Get(':id')
  getGame(@Param('id') _id: string) {
    return this.GameService.getGame({ _id });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create() {
    return this.GameService.createGame();
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  update(@Body() updateGameDto: UpdateGameDto) {
    const { id, inProgress } = updateGameDto;
    return this.GameService.updateGame(id, inProgress);
  }

  @Post('/player')
  @HttpCode(HttpStatus.CREATED)
  AddPlayer(@Body() addPlayerDto: AddPlayerDto) {
    const { id, gameId, name } = addPlayerDto;
    return this.GameService.addPlayer(id, name, gameId);
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly GameService: GameService) {}

  // @Get()
  // getAllGames() {
  //   return this.GameService.getAllGames();
  // }

  @Get(':id')
  getGame(@Param('id') gameId: string) {
    return this.GameService.getGame({ gameId });
  }

  // @Post()
  // @HttpCode(HttpStatus.CREATED)
  // create(@Body() createGameDto: CreateGameDto) {
  //   const { gameId } = createGameDto;
  //   return this.GameService.createGame(gameId);
  // }

  // @Patch()
  // @HttpCode(HttpStatus.OK)
  // update(@Body() updateGameDto: UpdateGameDto) {
  //   const { gameId, inProgress } = updateGameDto;
  //   return this.GameService.updateGame(gameId, inProgress);
  // }

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

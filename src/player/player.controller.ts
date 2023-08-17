import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { faker } from '@faker-js/faker';
import { AppConstants } from 'src/utils/constants';
import { PlayerService } from './player.service';

@Controller('player')
export class PlayerController {
  constructor(private readonly PlayerService: PlayerService) {}

  @Get()
  @HttpCode(HttpStatus.CREATED)
  async findPlayer(
    //@Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const name = faker.person.fullName();
    const res = await this.PlayerService.createPlayer(name);
    response.cookie(AppConstants.cookies.playerId, res);
    response.cookie(AppConstants.cookies.playerName, name);
    return AppConstants.response.successResponse({
      id: res,
      name,
    });
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  update(@Body() params: { id: string; name: string }) {
    const { id, name } = params;
    return this.PlayerService.updatePlayerName(id, name);
  }

  //   @Delete()
  //   @HttpCode(HttpStatus.OK)
  //   deleteGame(@Body() DeleteGameDto: CreateGameDto) {
  //     const { gameId } = DeleteGameDto;
  //     return this.GameService.deleteGame(gameId);
  //   }

  //   @Post('/player')
  //   @HttpCode(HttpStatus.CREATED)
  //   AddPlayer(@Body() addPlayerDto: AddPlayerDto) {
  //     const { id, gameId, name } = addPlayerDto;
  //     return this.GameService.addPlayer(id, name, gameId);
  //   }
}

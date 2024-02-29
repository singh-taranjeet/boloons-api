import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { GameGateway } from './gateway';
import { GameCacheService } from './game-cache.service';
import { AddPlayerDto } from './dto/add-player.dto/add-player.dto';
import { Events, GameMessages } from './utils/constants';
import { AppConstants } from 'src/utils/constants';
import { faker } from '@faker-js/faker';
import { PlayerService } from './player.service';

@Controller('player')
export class PlayerController {
  constructor(
    private readonly gameCacheService: GameCacheService,
    private readonly SocketService: GameGateway,
    private readonly PlayerService: PlayerService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.CREATED)
  async findPlayer() {
    const name = faker.person.fullName();
    const res = await this.PlayerService.createPlayer(name);
    return AppConstants.response.successResponse({
      id: res,
      name,
    });
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  async update(@Body() params: { id: string; name: string }) {
    const { id, name } = params;
    const response = await this.PlayerService.updatePlayerName(id, name);
    return AppConstants.response.successResponse(response);
  }

  @Post('/join-game')
  @HttpCode(HttpStatus.CREATED)
  async addPlayerToGame(@Body() params: AddPlayerDto) {
    const response = await this.gameCacheService.addPlayerToGame(params);
    const players = response?.players;
    const alreadyJoined = response?.alreadyJoined;

    // send a message to the session that player has joined
    if (Array.isArray(players)) {
      this.SocketService.emit<any[]>(
        params.gameId,
        Events.game.eventMessageType.playerJoinedMsg,
        players,
      );
      return AppConstants.response.successResponse(
        alreadyJoined ? GameMessages.playerJoined.playerAlreadyJoined : '',
      );
    }
    throw new BadRequestException(GameMessages.playerJoined.gameNotWaiting);
  }
}

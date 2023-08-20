import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { GameGateway } from './gateway';
import { GameCacheService } from './game-cache.service';
import { AddPlayerDto } from './dto/add-player.dto/add-player.dto';

@Controller('pplayer')
export class PlayerController {
  constructor(
    private readonly gameCacheService: GameCacheService,
    private readonly SocketService: GameGateway,
  ) {}

  @Post('/join-player')
  @HttpCode(HttpStatus.CREATED)
  async addPlayerToGame(@Body() params: AddPlayerDto) {
    const players = await this.gameCacheService.addPlayerToGame(params);

    // send a message to the session that player has joined
    if (Array.isArray(players) && players.length) {
      this.SocketService.serverInstance().emit(params.gameId, {
        type: 'PlayerjoinedMsg',
        players,
      });
    }
    throw new BadRequestException();
  }
}

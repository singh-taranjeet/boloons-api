import { IsEnum } from 'class-validator';
import { GameConstants } from 'src/game/utils/constants';
import { GameFamily, GameType } from 'src/game/utils/types';
export class CreateGameDto {
  @IsEnum(GameConstants.type)
  type: GameType;

  @IsEnum(GameConstants.family)
  family: GameFamily;
}

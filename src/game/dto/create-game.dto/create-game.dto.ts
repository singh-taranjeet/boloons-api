import { IsEnum } from 'class-validator';
import { GameConstants } from 'src/utils/constants';
import { GameFamily, GameType } from 'src/utils/schemas/types';
export class CreateGameDto {
  @IsEnum(GameConstants.type)
  type: GameType;

  @IsEnum(GameConstants.family)
  family: GameFamily;
}

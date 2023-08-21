import { IsEnum, IsString } from 'class-validator';
import { GameConstants } from 'src/game/utils/constants';
import { GameStep } from 'src/game/utils/types';
export class UpdateGameDto {
  @IsString()
  gameId: string;

  @IsEnum(GameConstants.step)
  step: GameStep;
}

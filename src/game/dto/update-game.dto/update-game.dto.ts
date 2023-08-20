import { IsEnum, IsString } from 'class-validator';
import { GameConstants } from 'src/utils/constants';
import { GameStep } from 'src/utils/schemas/types';
export class UpdateGameDto {
  @IsString()
  gameId: string;

  @IsEnum(GameConstants.step)
  step: GameStep;
}

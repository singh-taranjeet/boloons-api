import { IsArray, IsBoolean, IsString } from 'class-validator';
import { PlayerType } from 'src/game/schemas/types';
export class UpdateGameDto {
  @IsString()
  id: string;

  @IsBoolean()
  inProgress: boolean;
}

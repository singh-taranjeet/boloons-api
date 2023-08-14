import { IsObject, IsString } from 'class-validator';
import { PlayerType } from 'src/game/schemas/types';
export class AddPlayerDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  gameId: string;
}

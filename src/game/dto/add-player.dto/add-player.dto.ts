import { IsString } from 'class-validator';
export class AddPlayerDto {
  @IsString()
  playerId: string;

  @IsString()
  name: string;

  @IsString()
  gameId: string;
}

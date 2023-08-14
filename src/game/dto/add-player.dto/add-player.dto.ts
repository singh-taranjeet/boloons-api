import { IsString } from 'class-validator';
export class AddPlayerDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  gameId: string;
}

import { IsString } from 'class-validator';

export class StopGameDto {
  @IsString()
  gameId: string;
}

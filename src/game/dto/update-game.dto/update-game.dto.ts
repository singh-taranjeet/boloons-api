import { IsBoolean, IsString } from 'class-validator';
export class UpdateGameDto {
  @IsString()
  gameId: string;

  @IsBoolean()
  inProgress: boolean;
}

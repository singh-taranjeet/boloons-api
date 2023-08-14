import { IsBoolean, IsString } from 'class-validator';
export class UpdateGameDto {
  @IsString()
  id: string;

  @IsBoolean()
  inProgress: boolean;
}

import { IsString } from 'class-validator';
export class GetGameDto {
  @IsString()
  id: string;
}

import { IsString } from 'class-validator';
export class RemovePlayerDto {
  @IsString()
  id: string;
}

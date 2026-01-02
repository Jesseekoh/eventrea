import { IsString } from 'class-validator';
export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}

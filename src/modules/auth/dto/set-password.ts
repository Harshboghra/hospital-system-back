import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SetPasswordDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  password: string;
}

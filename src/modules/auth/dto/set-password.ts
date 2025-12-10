import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SetPasswordDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  password: string;
}

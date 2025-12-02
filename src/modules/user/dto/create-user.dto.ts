import { IsString, IsNotEmpty, IsEmail, IsNumber, ValidateIf } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsEmail()
  email: string;

  @IsNumber()
  userTypeId: number;

  @ValidateIf((o) => o.password)
  @IsString()
  password: string;
}

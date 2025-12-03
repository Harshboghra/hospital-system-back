import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsNumber,
  ValidateIf,
} from 'class-validator';
import { USER_TYPE } from 'src/modules/user-type/constant';

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

  @ValidateIf((o) => o.userTypeId === USER_TYPE.DOCTOR)
  @IsNumber()
  categoryId: number;
}

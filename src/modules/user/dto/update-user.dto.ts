import { IsNumber } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends CreateUserDto {
  @IsNumber()
  id: number;
}

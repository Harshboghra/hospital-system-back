import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserTypeDto {
  @IsString()
  @IsNotEmpty()
  type: string;
}

import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsEnum(['upcoming', 'completed', 'canceled'] as const)
  state: 'upcoming' | 'completed' | 'canceled';

  @IsNotEmpty()
  time: Date;

  @IsNumber()
  doctorId: number;

  @IsNumber()
  patientId: number;

  @IsNumber()
  categoryId: number;
}

import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsEnum(['upcoming', 'ongoing', 'completed'] as const)
  state: 'upcoming' | 'ongoing' | 'completed';

  @IsNotEmpty()
  time: Date;

  @IsNumber()
  doctorId: number;

  @IsNumber()
  patientId: number;

  @IsNumber()
  categoryId: number;
}

import { IsNumber, IsString } from 'class-validator';

export class CreateMedicineDto {
  @IsNumber()
  appointmentId: number;

  @IsString()
  name: string;

  @IsNumber()
  quantity: number;

  @IsString()
  dosage?: string;

  @IsString()
  instructions?: string;
}

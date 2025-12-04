import { IsNumber } from 'class-validator';

export class UpdateMedicineDto {
  @IsNumber()
  id: number;
}

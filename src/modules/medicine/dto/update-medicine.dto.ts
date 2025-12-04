import { IsNumber } from 'class-validator';
import { CreateMedicineDto } from './create-medicine.dto';

export class UpdateMedicineDto extends CreateMedicineDto {
  @IsNumber()
  id: number;
}

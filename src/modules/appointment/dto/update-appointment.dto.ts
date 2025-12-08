import { IsNumber } from 'class-validator';
import { CreateAppointmentDto } from './create-appointment.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @IsNumber()
  id: number;
}

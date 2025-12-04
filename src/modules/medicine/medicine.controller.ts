import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { MedicineService } from './medicine.service';
import { CreateAppointmentDto } from '../appointment/dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../appointment/dto/update-appointment.dto';

@Controller('medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  @Post()
  create(@Body() dto: CreateAppointmentDto) {
    return this.medicineService.create(dto);
  }

  @Post(':id')
  update(@Body() dto: UpdateAppointmentDto, @Param('id') id: number) {
    return this.medicineService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.medicineService.remove(id);
  }

  @Get('byAppointment/:appointmentId')
  findByAppointment(@Param('appointmentId') appointmentId: number) {
    return this.medicineService.findByAppointment(appointmentId);
  }
}

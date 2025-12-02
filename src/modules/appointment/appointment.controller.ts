import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  create(@Body() body: CreateAppointmentDto) {
    return this.appointmentService.create(body);
  }

  @Post(':id')
  update(@Param('id') id: number, @Body() body: Partial<CreateAppointmentDto>) {
    return this.appointmentService.update(id, body);
  }

  @Get()
  findAll() {
    return this.appointmentService.findAll();
  }
}

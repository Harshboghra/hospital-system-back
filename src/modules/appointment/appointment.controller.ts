import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  create(@Body() body: CreateAppointmentDto) {
    return this.appointmentService.create(body);
  }

  @Post(':id')
  update(@Param('id') id: number, @Body() body: UpdateAppointmentDto) {
    return this.appointmentService.update(id, body);
  }

  @Get()
  findAll() {
    return this.appointmentService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: number) {
    return this.appointmentService.findById(id);
  }

  @Post('cancel/:id')
  cancelAppointment(@Param('id') id: number) {
    return this.appointmentService.cancelAppointment(id);
  }
}

import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
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
  findAll(@Req() req) {
    const user = req.user;
    return this.appointmentService.findAll(user);
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

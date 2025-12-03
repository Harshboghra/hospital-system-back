import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
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

  @Post('cancel/:id')
  cancelAppointment(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.cancelAppointment(id);
  }
}

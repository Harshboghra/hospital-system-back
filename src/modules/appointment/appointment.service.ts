import { Injectable } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AbstractService } from 'src/common/abstract.service';
import { appointmentRepository } from './repository/user.repository';

@Injectable()
export class AppointmentService extends AbstractService {
  constructor() {
    super(appointmentRepository);
  }

  async create(dto: CreateAppointmentDto) {
    return await this.create(dto);
  }

  findAll() {
    return this.find({
      relations: ['doctor', 'patient'],
    });
  }
}

import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/common/abstract.service';
import { medicineRepository } from './repository/medicine.repository';
import { CreateAppointmentDto } from '../appointment/dto/create-appointment.dto';

@Injectable()
export class MedicineService extends AbstractService {
  constructor() {
    super(medicineRepository);
  }

  findByAppointment(appointmentId: number) {
    return this.find({
      where: { appointmentId },
    });
  }

  async create(dto: CreateAppointmentDto) {
    return this.abstractCreate(dto);
  }

  async update(id: number, dto: CreateAppointmentDto) {
    return this.abstractUpdate(id, dto);
  }

  async remove(id: number) {
    return this.abstractRemove(id);
  }
}

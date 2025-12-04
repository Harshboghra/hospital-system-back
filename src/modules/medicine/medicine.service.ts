import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/common/abstract.service';
import { medicineRepository } from './repository/medicine.repository';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { CreateMedicineDto } from './dto/create-medicine.dto';

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

  async create(dto: CreateMedicineDto) {
    return this.abstractCreate(dto);
  }

  async update(id: number, dto: UpdateMedicineDto) {
    return this.abstractUpdate(id, dto);
  }

  async remove(id: number) {
    return this.abstractRemove(id);
  }
}

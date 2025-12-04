import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AbstractService } from 'src/common/abstract.service';
import { appointmentRepository } from './repository/user.repository';
import { Between, FindOneOptions } from 'typeorm';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { USER_TYPE } from '../user-type/constant';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { APPOINTMENT_STATE } from './constant';

@Injectable()
export class AppointmentService extends AbstractService {
  constructor(protected readonly userService: UserService) {
    super(appointmentRepository);
  }

  async create(data: CreateAppointmentDto) {
    // Validate appointment data
    await this.validateAppointmentData(data);

    // Create appointment
    return this.abstractCreate(data);
  }

  async update(id: number, data: UpdateAppointmentDto) {
    // Validate appointment data
    await this.validateAppointmentData(data);

    // Update appointment
    return this.abstractUpdate(id, data);
  }

  findAll() {
    return this.find({
      relations: ['doctor', 'patient'],
    });
  }

  findById(id: number) {
    return this.findOne({ where: { id }, relations: ['doctor', 'patient'] });
  }

  async cancelAppointment(id: number) {
    const appointment = await this.findOne({ where: { id }, select: ['id'] });
    if (!appointment) {
      throw new BadRequestException('Appointment not found');
    }

    return this.abstractUpdate(id, {
      id: id,
      state: APPOINTMENT_STATE.CANCELED,
    });
  }

  async count(options: FindOneOptions = {}): Promise<number> {
    return this.countByCondition(options);
  }

  private async validateAppointmentData(
    data: UpdateAppointmentDto | CreateAppointmentDto,
  ) {
    const { doctorId, patientId, time, categoryId } = data;

    // Validate doctor role
    const doctor: User = await this.userService.findOne({
      where: { id: doctorId },
    });

    if (!doctor || doctor.userTypeId !== USER_TYPE.DOCTOR) {
      throw new BadRequestException('Selected doctorId is not a doctor');
    }
    if (doctor.categoryId !== categoryId) {
      throw new BadRequestException(
        'Doctor does not belong to the selected category',
      );
    }

    // Validate patient role
    const patient: User = await this.userService.findOne({
      where: { id: patientId },
      relations: ['category'],
    });

    if (!patient || patient.userTypeId !== USER_TYPE.PATIENT) {
      throw new BadRequestException('Selected patientId is not a patient');
    }

    // TIME RANGE CHECK 30 MIN
    const startTime = new Date(time);
    const endTime = new Date(startTime.getTime() + 30 * 60000);

    const conflict = await this.findOne({
      where: {
        doctorId,
        time: Between(startTime, endTime),
      },
    });

    if (conflict) {
      if (conflict.id == ((data as UpdateAppointmentDto)?.id || 0)) {
        return;
      }
      throw new BadRequestException(
        'Doctor already has an appointment in this time slot',
      );
    }
  }
}

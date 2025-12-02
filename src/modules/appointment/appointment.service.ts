import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AbstractService } from 'src/common/abstract.service';
import { appointmentRepository } from './repository/user.repository';
import { Between } from 'typeorm';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';

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

  async update(id: number, data: Partial<CreateAppointmentDto>) {
    // Validate appointment data
    await this.validateAppointmentData(data as CreateAppointmentDto);

    // Update appointment
    return this.abstractUpdate(id, data);
  }

  findAll() {
    return this.find({
      relations: ['doctor', 'patient'],
    });
  }

  private async validateAppointmentData(data: CreateAppointmentDto) {
    const { doctorId, patientId, time } = data;

    // Validate doctor role
    const doctor: User = await this.userService.findOne({
      where: { id: doctorId },
      relations: ['userType'],
    });

    if (!doctor || doctor.userType.type !== 'doctor') {
      throw new BadRequestException('Selected doctorId is not a doctor');
    }

    // Validate patient role
    const patient: User = await this.userService.findOne({
      where: { id: patientId },
      relations: ['userType'],
    });

    if (!patient || patient.userType.type !== 'patient') {
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
      throw new BadRequestException(
        'Doctor already has an appointment in this time slot',
      );
    }
  }
}

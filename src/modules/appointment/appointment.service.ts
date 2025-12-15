import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AbstractService } from 'src/common/abstract.service';
import { appointmentRepository } from './repository/user.repository';
import { Between, FindOneOptions } from 'typeorm';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { USER_TYPE } from '../../common/constant';
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
    const existingAppointment = await this.findOne({ where: { id } });

    // Validate appointment data
    await this.validateAppointmentData({ ...existingAppointment, ...data });

    // Update appointment
    return this.abstractUpdate(id, data);
  }

  async findAll(
    user: User,
    filters?: { search?: string; page?: number; limit?: number; status?: string },
  ) {
    const { search, page = 1, limit = 10, status } = filters || {};
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('doctor.doctorProfile', 'doctorProfile')
      .leftJoinAndSelect('patient.patientProfile', 'patientProfile');

    // Apply user-specific filters
    if (Number(user.userTypeId) === USER_TYPE.DOCTOR) {
      queryBuilder.andWhere('appointment.doctorId = :doctorId', {
        doctorId: user.id,
      });
    } else if (Number(user.userTypeId) === USER_TYPE.PATIENT) {
      queryBuilder.andWhere('appointment.patientId = :patientId', {
        patientId: user.id,
      });
    }

    // Apply status filter
    if (status) {
      if (status === 'today') {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        queryBuilder.andWhere('appointment.time BETWEEN :startDate AND :endDate', {
          startDate: startOfDay,
          endDate: endOfDay
        });
      } else {
        queryBuilder.andWhere('appointment.state = :status', { status });
      }
    }

    // Apply search filter (case-insensitive)
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(doctor.name) LIKE LOWER(:search) OR LOWER(patient.name) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('appointment.createdAt', 'DESC');

    // Get total count for pagination
    const totalQuery = queryBuilder.clone();
    const total = await totalQuery.getCount();

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findById(id: number) {
    return this.findOne({
      where: { id },
      relations: [
        'doctor',
        'doctor.doctorProfile',
        'patient',
        'patient.patientProfile',
        'medicines',
      ],
    });
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

  async findAllByState(userId: Number, state: String, limit?: number) {
    return this.find({
      where: { state, patientId: userId },
      relations: ['doctor', 'patient'],
      take: limit || 4,
    });
  }

  private async validateAppointmentData(
    data: UpdateAppointmentDto | CreateAppointmentDto,
  ) {
    const { doctorId, patientId, time, categoryId } = data;

    // Validate doctor role
    const doctor: User = await this.userService.findOne({
      where: { id: doctorId },
      relations: ['doctorProfile'],
    });

    if (!doctor || doctor.userTypeId !== USER_TYPE.DOCTOR) {
      throw new BadRequestException('Selected doctorId is not a doctor');
    }
    if (!doctor.doctorProfile) {
      throw new BadRequestException(
        'Doctor profile is missing for this doctor',
      );
    }
    const doctorCategoryId = doctor.doctorProfile?.categoryId;
    if (doctorCategoryId && categoryId && doctorCategoryId !== categoryId) {
      throw new BadRequestException(
        'Doctor does not belong to the selected category',
      );
    }
    if (!data.categoryId && doctorCategoryId) {
      (data as any).categoryId = doctorCategoryId;
    }

    // Validate patient role
    const patient: User = await this.userService.findOne({
      where: { id: patientId },
      relations: ['patientProfile'],
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

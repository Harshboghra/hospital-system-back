import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AbstractService } from 'src/common/abstract.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindOneOptions } from 'typeorm';
import { User } from './entities/user.entity';
import { CLOUDINARY } from '../cloudinary/cloudinary.provider';
import { v2 as Cloudinary } from 'cloudinary';
import { dataSource } from 'src/core/data-source';
import { DoctorProfile } from './entities/doctor-profile.entity';
import { PatientProfile } from './entities/patient-profile.entity';
import { userRepository } from './repository/user.repository';
import { USER_TYPE } from 'src/common/constant';

@Injectable()
export class UserService extends AbstractService {
  constructor(
    @Inject(CLOUDINARY)
    private readonly cloudinary: typeof Cloudinary,
  ) {
    super(userRepository);
  }

  async create(dto: CreateUserDto) {
    return dataSource.transaction(async (manager) => {
      const { doctorProfile, patientProfile, ...userPayload } = dto;

      if (dto.userTypeId === USER_TYPE.DOCTOR && !doctorProfile) {
        throw new BadRequestException('Doctor profile details are required');
      }
      if (dto.userTypeId === USER_TYPE.DOCTOR && !doctorProfile?.categoryId) {
        throw new BadRequestException('Doctor category is required');
      }

      // Check for email uniqueness
      const emailExists = await manager.findOne(User, {
        where: { email: userPayload.email },
      });
      if (emailExists) {
        throw new BadRequestException('Email already exists');
      }

      // Check for phone number uniqueness
      const phoneExists = await manager.findOne(User, {
        where: { phoneNumber: userPayload.phoneNumber },
      });
      if (phoneExists) {
        throw new BadRequestException('Phone number already exists');
      }

      const user = manager.create(User, userPayload);
      const savedUser = await manager.save(User, user);

      if (dto.userTypeId === USER_TYPE.DOCTOR) {
        const profilePayload = doctorProfile || {};
        const profile = manager.create(DoctorProfile, {
          ...profilePayload,
          userId: savedUser.id,
        });
        await manager.save(DoctorProfile, profile);
      } else if (dto.userTypeId === USER_TYPE.PATIENT) {
        const profilePayload = patientProfile || {};
        const profile = manager.create(PatientProfile, {
          ...profilePayload,
          userId: savedUser.id,
        });
        await manager.save(PatientProfile, profile);
      }

      return manager.findOne(User, {
        where: { id: savedUser.id },
        relations: [
          'doctorProfile',
          'doctorProfile.category',
          'patientProfile',
        ],
      });
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    const user: User = await this.findOne({
      where: { id },
      relations: ['doctorAppointments', 'patientAppointments'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check for email uniqueness if email is being updated
    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.findOne({ where: { email: dto.email } });
      if (emailExists) {
        throw new BadRequestException('Email already exists');
      }
    }

    // Check for phone number uniqueness if phone number is being updated
    if (dto.phoneNumber && dto.phoneNumber !== user.phoneNumber) {
      const phoneExists = await this.findOne({
        where: { phoneNumber: dto.phoneNumber },
      });
      if (phoneExists) {
        throw new BadRequestException('Phone number already exists');
      }
    }

    if (
      dto.userTypeId !== undefined &&
      dto.userTypeId !== null &&
      dto.userTypeId !== user.userTypeId
    ) {
      if (user.doctorAppointments.length > 0) {
        throw new BadRequestException({
          message:
            'Cannot change user type to Doctor because the user has existing appointments as a doctor.',
          details:
            'User has existing appointments as a doctor. Change the appointments or delete them before changing the user type.',
        });
      }
      if (user.patientAppointments.length > 0) {
        throw new BadRequestException({
          message:
            'Cannot change user type to Patient because the user has existing appointments as a patient.',
          details:
            'User has existing appointments as a patient. Change the appointments or delete them before changing the user type.',
        });
      }
    }

    return dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(User);
      const existing = await repo.findOne({
        where: { id },
        relations: ['doctorProfile', 'patientProfile'],
      });

      if (!existing) {
        throw new NotFoundException('User not found');
      }

      const { doctorProfile, patientProfile, ...userPayload } = dto;

      // Check for email uniqueness if email is being updated
      if (userPayload.email && userPayload.email !== existing.email) {
        const emailExists = await repo.findOne({
          where: { email: userPayload.email },
        });
        if (emailExists) {
          throw new BadRequestException('Email already exists');
        }
      }

      const targetUserType: number =
        userPayload.userTypeId ?? existing.userTypeId;

      if (userPayload.userTypeId && targetUserType !== existing.userTypeId) {
        if (existing.doctorAppointments.length > 0) {
          throw new BadRequestException({
            message:
              'Cannot change user type to Doctor because the user has existing appointments as a doctor.',
            details:
              'User has existing appointments as a doctor. Change the appointments or delete them before changing the user type.',
          });
        }
        if (existing.patientAppointments.length > 0) {
          throw new BadRequestException({
            message:
              'Cannot change user type to Patient because the user has existing appointments as a patient.',
            details:
              'User has existing appointments as a patient. Change the appointments or delete them before changing the user type.',
          });
        }
      }

      if (userPayload.userTypeId === USER_TYPE.DOCTOR && !doctorProfile) {
        throw new BadRequestException({
          message: 'Doctor profile details are required.',
          details: 'Please provide doctor profile payload.',
        });
      }
      if (
        targetUserType === USER_TYPE.DOCTOR &&
        (!doctorProfile || !doctorProfile.categoryId)
      ) {
        throw new BadRequestException('Doctor category is required.');
      }

      if (
        existing.userTypeId === USER_TYPE.DOCTOR &&
        targetUserType === USER_TYPE.DOCTOR &&
        existing.doctorProfile?.categoryId !== doctorProfile?.categoryId &&
        existing.doctorAppointments.length > 0
      ) {
        throw new BadRequestException(
          'Cannot change doctor category because the doctor has existing appointments.',
        );
      }

      await repo.update(id, userPayload);

      if (targetUserType === USER_TYPE.DOCTOR) {
        const doctorRepo = manager.getRepository(DoctorProfile);
        const current = await doctorRepo.findOne({ where: { userId: id } });
        const payload = { ...doctorProfile, userId: id };
        if (current) {
          await doctorRepo.update({ userId: id }, payload);
        } else {
          await doctorRepo.save(payload);
        }

        // remove patient profile if switching
        if (
          existing.patientProfile &&
          Number(targetUserType) !== USER_TYPE.PATIENT
        ) {
          await manager.getRepository(PatientProfile).delete({ userId: id });
        }
      } else if (targetUserType === USER_TYPE.PATIENT) {
        const patientRepo = manager.getRepository(PatientProfile);
        const current = await patientRepo.findOne({ where: { userId: id } });
        const payload = { ...(patientProfile || {}), userId: id };
        if (current) {
          await patientRepo.update({ userId: id }, payload);
        } else {
          await patientRepo.save(payload);
        }

        // remove doctor profile when downgrading to patient
        if (
          existing.doctorProfile &&
          Number(targetUserType) !== USER_TYPE.DOCTOR
        ) {
          await manager.getRepository(DoctorProfile).delete({ userId: id });
        }
      } else {
        // neither doctor nor patient -> clean up profiles
        await manager.getRepository(DoctorProfile).delete({ userId: id });
        await manager.getRepository(PatientProfile).delete({ userId: id });
      }

      return repo.findOne({
        where: { id },
        relations: [
          'doctorProfile',
          'doctorProfile.category',
          'patientProfile',
        ],
      });
    });
  }

  async remove(id: number) {
    const errorMessage = await this.checkRelatedObjects(id);
    if (errorMessage) {
      throw new BadRequestException({
        message: `User cannot be deleted because ${errorMessage}.`,
        details: errorMessage,
      });
    }
    return this.abstractRemove(id);
  }

  findAll() {
    return this.find({
      relations: ['doctorProfile', 'doctorProfile.category', 'patientProfile'],
    });
  }

  async changePassword(id: number, newPassword: string) {
    await this.abstractUpdate(id, { password: newPassword });
    return true;
  }

  async findByUserTypeId(
    userTypeId: number,
    filters?: { page?: number; limit?: number; search?: string },
  ) {
    const { page = 1, limit = 10, search } = filters || {};
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.doctorProfile', 'doctorProfile')
      .leftJoinAndSelect('user.patientProfile', 'patientProfile')
      .leftJoinAndSelect('doctorProfile.category', 'category')
      .where('user.userTypeId = :userTypeId', { userTypeId })
      .orderBy('user.createdAt', 'DESC');

    // Apply search filter (case-insensitive)
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(user.name) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search)) OR LOWER(user.phoneNumber) LIKE LOWER(:search) OR LOWER(category.name) LIKE LOWER(:search)',
        { search: `%${search}%` },
      );
    } else {
      // Apply pagination
      queryBuilder.skip(skip).take(limit);
    }

    // Get total count for pagination
    const totalQuery = queryBuilder.clone();
    const total = await totalQuery.getCount();

    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findDoctorByCategoryId(categoryId: number) {
    return this.find({
      where: {
        userTypeId: USER_TYPE.DOCTOR,
        doctorProfile: { categoryId },
      },
      relations: ['doctorProfile', 'doctorProfile.category'],
      order: { id: 'desc' },
    });
  }

  async count(options: FindOneOptions = {}): Promise<number> {
    return this.countByCondition(options);
  }

  async updateProfileImage(
    userId: string,
    file: Express.Multer.File,
  ): Promise<User> {
    const user = await this.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.profileImagePublicId) {
      try {
        await this.cloudinary.uploader.destroy(user.profileImagePublicId);
      } catch (err) {
        // You can log error but still continue with new upload
        console.error('Error deleting old Cloudinary image:', err);
      }
    }

    // Upload to Cloudinary
    const uploadResult = await this.cloudinary.uploader.upload(file.path, {
      folder: 'user_profiles', // optional: folder in Cloudinary
      public_id: `user_${userId}`, // optional: deterministic public_id
      overwrite: true,
    });

    // Save URL + public_id in DB
    user.profileImageUrl = uploadResult.secure_url;
    user.profileImagePublicId = uploadResult.public_id;

    return this.abstractUpdate(user.id, user);
  }

  private async checkRelatedObjects(id: number): Promise<string> {
    const relations = [
      {
        relation: 'doctorAppointments',
        message: 'appointments as a doctor',
      },
      {
        relation: 'patientAppointments',
        message: 'appointments as a patient',
      },
    ];
    let errorMessage = '';

    for (const rel of relations) {
      const count = await this.countInRelation(rel.relation, id);
      if (count) {
        errorMessage += rel.message + ', ';
      }
    }

    return errorMessage.slice(0, -2);
  }
}

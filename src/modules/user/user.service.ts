import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { userRepository } from './repository/user.repository';
import { AbstractService } from 'src/common/abstract.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { USER_TYPE } from '../user-type/constant';
import { FindOneOptions } from 'typeorm';
import { User } from './entities/user.entity';
import { CLOUDINARY } from '../cloudinary/cloudinary.provider';
import { v2 as Cloudinary } from 'cloudinary';

@Injectable()
export class UserService extends AbstractService {
  constructor(
    @Inject(CLOUDINARY)
    private readonly cloudinary: typeof Cloudinary,
  ) {
    super(userRepository);
  }

  async create(dto: CreateUserDto) {
    return this.abstractCreate(dto, ['userType']);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user: User = await this.findOne({
      where: { id },
      relations: ['doctorAppointments', 'patientAppointments'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.userTypeId !== user.userTypeId) {
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

    if (dto.categoryId && dto.userTypeId !== USER_TYPE.DOCTOR) {
      throw new BadRequestException({
        message: 'Only users with Doctor type can have a category.',
        details: 'Set user type to Doctor to assign a category.',
      });
    }

    if (dto.userTypeId === USER_TYPE.DOCTOR) {
      if (!dto.categoryId) {
        throw new BadRequestException({
          message: 'Doctor users must have a category assigned.',
          details: 'Please provide a valid categoryId for the doctor user.',
        });
      }
    }

    if (
      user.categoryId !== dto.categoryId &&
      user.userTypeId === USER_TYPE.DOCTOR
    ) {
      const hasAppointments = user.doctorAppointments.length > 0;
      if (hasAppointments)
        throw new BadRequestException(
          'Cannot change category because the doctor has existing appointments.',
        );
    }

    // dto.userTypeId === USER_TYPE.DOCTOR
    return this.abstractUpdate(id, dto);
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
      relations: ['userType'],
    });
  }

  async changePassword(id: number, newPassword: string) {
    await this.abstractUpdate(id, { password: newPassword });
    return true;
  }

  async findByUserTypeId(userTypeId: number) {
    return this.find({
      where: { userType: { id: userTypeId } },
      relations: ['category'],
      order: { id: 'desc' },
    });
  }

  async findDoctorByCategoryId(categoryId: number) {
    return this.find({
      where: {
        category: { id: categoryId },
        userType: { id: USER_TYPE.DOCTOR },
      },
      relations: ['category'],
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

import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { userRepository } from './repository/user.repository';
import { AbstractService } from 'src/common/abstract.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { USER_TYPE } from '../user-type/constant';
import { FindOneOptions } from 'typeorm';

@Injectable()
export class UserService extends AbstractService {
  constructor() {
    super(userRepository);
  }

  async create(dto: CreateUserDto) {
    return this.abstractCreate(dto, ['userType']);
  }

  async update(id: number, dto: UpdateUserDto) {
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

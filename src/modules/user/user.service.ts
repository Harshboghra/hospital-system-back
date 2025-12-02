import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { userRepository } from './repository/user.repository';
import { AbstractService } from 'src/common/abstract.service';
import * as bcrypt from 'bcrypt';
import { cleanedData } from 'src/common/function';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService extends AbstractService {
  constructor() {
    super(userRepository);
  }

  async create(dto: CreateUserDto) {
    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      dto.password = await bcrypt.hash(dto.password, salt);
    }
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

  async validateUser(email: string, password: string) {
    const user = await this.findOne({
      select: ['id', 'password'],
      where: { email },
    });

    if (!user)
      return {
        id: null,
        message: 'User not found',
      };

    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch
      ? { id: user.id }
      : {
          id: null,
          message: 'Password is incorrect',
        };
  }

  private async checkRelatedObjects(id: number): Promise<string> {
    const relations = [
      {
        relation: 'appointments',
        message: 'Appointments exist',
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

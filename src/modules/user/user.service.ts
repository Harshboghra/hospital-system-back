import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { userRepository } from './repository/user.repository';
import { AbstractService } from 'src/common/abstract.service';
import * as bcrypt from 'bcrypt';

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
}

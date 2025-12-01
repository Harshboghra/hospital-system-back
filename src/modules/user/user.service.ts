import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { userRepository } from './repository/user.repository';
import { AbstractService } from 'src/common/abstract.service';

@Injectable()
export class UserService extends AbstractService {
  constructor() {
    super(userRepository);
  }

  async create(dto: CreateUserDto) {
    return this.abstractCreate(dto, ['userType']);
  }

  findAll() {
    return this.find({
      relations: ['userType'],
    });
  }
}

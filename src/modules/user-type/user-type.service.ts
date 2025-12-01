import { Injectable } from '@nestjs/common';
import { CreateUserTypeDto } from './dto/create-usertype.dto';
import { userTypeRepository } from './repository/user.repository';
import { AbstractService } from 'src/common/abstract.service';

@Injectable()
export class UserTypeService extends AbstractService {
  constructor() {
    super(userTypeRepository);
  }

  create(createDto: CreateUserTypeDto) {
    const type = this.abstractCreate(createDto);
  }

  findAll() {
    return this.findAll();
  }

  findById(id: number) {
    return this.findOne({ where: { id } });
  }
}

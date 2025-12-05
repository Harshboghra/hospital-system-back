import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { USER_TYPE } from '../user-type/constant';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post(':id')
  update(@Param('id') id: number, @Body() body: UpdateUserDto) {
    return this.userService.update(id, body);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }

  @Get('byUserType/:userTypeId')
  findByUserTypeId(@Param('userTypeId') userTypeId: number) {
    return this.userService.findByUserTypeId(userTypeId);
  }

  @Get('doctorsByCategory/:categoryId')
  findDoctorByCategoryId(@Param('categoryId') categoryId: number) {
    return this.userService.findDoctorByCategoryId(categoryId);
  }
}

import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  @Post('validate')
  validateUser(@Body() body: { email: string; password: string }) {
    return this.userService.validateUser(body.email, body.password);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }

  // get by userTypeId
  @Get('byUserType/:userTypeId')
  findByUserTypeId(@Param('userTypeId') userTypeId: number) {
    return this.userService.findByUserTypeId(userTypeId);
  }

  @Get('doctorsByCategory/:categoryId')
  findDoctorByCategoryId(@Param('categoryId') categoryId: number) {
    return this.userService.findDoctorByCategoryId(categoryId);
  }
}

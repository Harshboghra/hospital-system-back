import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Patch,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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
  findByUserTypeId(@Param('userTypeId') userTypeId: number, @Req() req) {
    const { page = 1, limit = 10, search } = req.query;
    return this.userService.findByUserTypeId(userTypeId, {
      page: Number(page),
      limit: Number(limit),
      search,
    });
  }

  @Get('doctorsByCategory/:categoryId')
  findDoctorByCategoryId(@Param('categoryId') categoryId: number) {
    return this.userService.findDoctorByCategoryId(categoryId);
  }

  @Patch(':id/profile-image')
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: diskStorage({
        destination: './uploads/tmp', // temp folder
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|jpg|webp)$/)) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async updateProfileImage(
    @Param('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const updatedUser = await this.userService.updateProfileImage(userId, file);
    return {
      message: 'Profile image updated',
      profileImageUrl: updatedUser.profileImageUrl,
    };
  }
}

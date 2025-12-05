import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/modules/user/user.service';
import { User } from 'src/modules/user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { USER_TYPE } from '../user-type/constant';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // ---------- LOGIN ----------
  async login(email: string, password: string) {
    // get user with password (select: false in entity!)
    const user: User = await this.userService.findOne({
      where: { email },
      select: ['id', 'password', 'email', 'userTypeId', 'categoryId'],
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      userTypeId: user.userTypeId,
      categoryId: user.categoryId,
    };

    const token = this.jwtService.sign(payload);

    // don’t expose password
    delete (user as User).password;

    return {
      access_token: token,
      user,
    };
  }

  // ---------- SELF REGISTER (user signs up himself) ----------
  async register(dto: RegisterDto) {
    // check duplicate email
    const exists = await this.userService.findOne({
      where: { email: dto.email },
    });
    if (exists) {
      throw new BadRequestException('Email already registered');
    }

    // hash password HERE (not in UserService)
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(dto.password, salt);

    const toCreate = {
      ...dto,
      password: hashed,
      userTypeId: USER_TYPE.PATIENT,
    };

    // this uses UserService, but UserService does not hash
    const user: User = (await this.userService.abstractCreate(toCreate, [
      'userType',
    ])) as User;

    const payload = {
      sub: user.id,
      email: user.email,
      userTypeId: user.userTypeId,
      categoryId: user.categoryId,
    };

    const token = this.jwtService.sign(payload);

    delete (user as User).password;

    return {
      access_token: token,
      user,
    };
  }

  // ---------- FIRST TIME SET PASSWORD (admin created user without password) ----------
  async setPasswordFirstTime(id: number, newPassword: string) {
    const user: User = await this.userService.findOne({
      where: { id },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.password) {
      throw new BadRequestException(
        'Password already exists. Use changePassword.',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    await this.userService.changePassword(user.id, hashed);

    return { message: 'Password set successfully' };
  }

  // ---------- CHANGE PASSWORD (user logged in) ----------
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userService.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user || !user.password) {
      throw new BadRequestException('Password not set for this user');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    await this.userService.changePassword(userId, hashed);

    return { message: 'Password changed successfully' };
  }

  // ---------- CHECK PASSWORD STATUS BY EMAIL ----------
  async checkPasswordStatusByEmail(email: string) {
    const user = await this.userService.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'userTypeId', 'categoryId'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isFirstTime = !user.password; // null or undefined => first time

    return {
      userId: user.id,
      email: user.email,
      isFirstTimePasswordSet: isFirstTime,
      message: isFirstTime
        ? 'Password not set yet. Please set password first time.'
        : 'Password already set. Please login with email and password.',
    };
  }
}

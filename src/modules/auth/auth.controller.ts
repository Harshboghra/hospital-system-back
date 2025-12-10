import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { SetPasswordDto } from './dto/set-password';
import { Public } from 'src/common/decorators/public.decorator';
import { CheckEmailDto } from './dto/check-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  // user self-register (sign up)
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // user sets password first time (for accounts created by admin)
  @Public()
  @Post('set-password')
  async setPassword(@Body() body: SetPasswordDto) {
    return this.authService.setPasswordFirstTime(body.userId, body.password);
  }

  // check if email exists and if password is set
  @Public()
  @Post('check-email')
  async checkEmail(@Body() body: CheckEmailDto) {
    return this.authService.checkPasswordStatusByEmail(body.email);
  }

  // user changes password
  @Post('change-password')
  async changePassword(
    @Req() req: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const userId = req.user.id; // from JWT payload (JwtStrategy)
    return this.authService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword,
    );
  }

  // Example of protected route to get logged-in user
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return req.user; // filled by JwtStrategy.validate()
  }
}

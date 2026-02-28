import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('oauth')
  async oauthLogin(
    @Body() body: { email: string; name: string; provider: string; providerId: string },
  ) {
    return this.authService.oauthLogin(body.email, body.name, body.provider, body.providerId);
  }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /** 어드민 전용 로그인 */
  @Post('admin/login')
  async adminLogin(@Body() body: { email: string; password: string }) {
    return this.authService.adminLogin(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.authService.findUserById(req.user.userId ?? req.user.id);
  }

  /** 유저 role 변경 (ADMIN 전용) */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('users/:id/role')
  async setRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { role: 'USER' | 'ADMIN' },
  ) {
    return this.authService.setUserRole(id, body.role);
  }
}

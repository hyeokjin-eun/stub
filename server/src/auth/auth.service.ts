import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, password, nickname, bio } = signupDto;

    // 이메일 중복 체크
    const existingUserByEmail = await this.userRepo.findOne({
      where: { email },
    });
    if (existingUserByEmail) {
      throw new ConflictException('이미 사용 중인 이메일입니다');
    }

    // 닉네임 중복 체크
    const existingUserByNickname = await this.userRepo.findOne({
      where: { nickname },
    });
    if (existingUserByNickname) {
      throw new ConflictException('이미 사용 중인 닉네임입니다');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = this.userRepo.create({
      email,
      password_hash: hashedPassword,
      nickname,
      bio,
    });

    await this.userRepo.save(user);

    // 비밀번호 제거 후 반환
    const { password_hash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      nickname: user.nickname,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        bio: user.bio,
        avatar_url: user.avatar_url,
        onboarding_completed: user.onboarding_completed || false,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !user.password_hash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return null;
    }

    const { password_hash, ...result } = user;
    return result;
  }

  async oauthLogin(email: string, name: string, provider: string, providerId: string) {
    // 기존 유저 조회
    let user = await this.userRepo.findOne({ where: { email } })

    if (!user) {
      // 신규 유저 생성
      const nickname = name?.replace(/\s/g, '') || `user_${Date.now()}`
      // 닉네임 중복 방지
      const existingNickname = await this.userRepo.findOne({ where: { nickname } })
      user = this.userRepo.create({
        email,
        nickname: existingNickname ? `${nickname}_${Date.now()}` : nickname,
        oauth_provider: provider,
        oauth_id: providerId,
      })
      await this.userRepo.save(user)
    }

    const payload = { sub: user.id, email: user.email, nickname: user.nickname }
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        bio: user.bio,
        avatar_url: user.avatar_url,
        onboarding_completed: user.onboarding_completed || false,
      },
    }
  }

  async findUserById(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) return null;
    const { password_hash, ...result } = user;
    return result;
  }

  /** 어드민 전용 로그인 — role = ADMIN 인 계정만 허용 */
  async adminLogin(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !user.password_hash) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
    if (user.role !== 'ADMIN') throw new UnauthorizedException('어드민 권한이 없습니다');

    const payload = { sub: user.id, email: user.email, nickname: user.nickname, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role },
    };
  }

  /** 특정 유저 role 변경 (ADMIN 전용) */
  async setUserRole(targetId: number, role: 'USER' | 'ADMIN') {
    await this.userRepo.update(targetId, { role });
    return { ok: true };
  }
}

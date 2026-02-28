import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: number;
  email: string;
  nickname: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'otbook-secret-key-change-in-production',
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      id: payload.sub,
      email: payload.email,
      nickname: payload.nickname,
    };
  }
}

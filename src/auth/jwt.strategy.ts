// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Bearer token 추출
      secretOrKey: 'MY_SECRET_KEY', // JWT 비밀키 (나중에 env로)
    });
  }

  async validate(payload: any) {
    // payload: { sub: user.id, username: user.username }
    return { userId: payload.sub, username: payload.username };
  }
}

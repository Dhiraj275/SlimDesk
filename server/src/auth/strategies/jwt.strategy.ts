import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service.js';
import { User } from '../../users/entities/user.entity.js';
import { Role } from '../enums/role.enum.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
  tokenType?: 'access' | 'refresh';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'supersecret_jwt_key_replace_in_production',
      ),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    if (payload.tokenType && payload.tokenType !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    try {
      return await this.usersService.findById(payload.sub);
    } catch {
      throw new UnauthorizedException('Invalid token or user no longer exists');
    }
  }
}

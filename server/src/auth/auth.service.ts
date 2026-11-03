import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';
import { SignupDto } from './dto/signup.dto.js';
import { SigninDto } from './dto/signin.dto.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import { JwtPayload } from './strategies/jwt.strategy.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
    const user = await this.usersService.create({
      displayName: signupDto.displayName,
      email: signupDto.email,
      password: signupDto.password,
    });

    return this.generateAuthResponse(user);
  }

  async signin(signinDto: SigninDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmailWithPassword(signinDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(signinDto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateAuthResponse(user);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'supersecret_refresh_jwt_key_replace_in_production',
    );

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    const user = await this.usersService.findById(payload.sub).catch(() => null);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateAuthResponse(user);
  }

  private generateAuthResponse(user: User): AuthResponseDto {
    const payload: JwtPayload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
      tokenType: 'access',
    };

    const accessSecret = this.configService.get<string>(
      'JWT_SECRET',
      'supersecret_jwt_key_replace_in_production',
    );
    const accessExpiresIn = this.configService.get<string>(
      'JWT_EXPIRES_IN',
      '15m',
    );

    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'supersecret_refresh_jwt_key_replace_in_production',
    );
    const refreshExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );

    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: accessExpiresIn as any,
    });

    const refreshToken = this.jwtService.sign(
      {
        sub: user.userId,
        email: user.email,
        role: user.role,
        tokenType: 'refresh',
      },
      {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn as any,
      },
    );

    return new AuthResponseDto(accessToken, refreshToken, user);
  }
}

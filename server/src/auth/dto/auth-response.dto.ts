import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity.js';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Access Token',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT token alias for client compatibility',
  })
  token: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Refresh Token',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User details',
    required: false,
  })
  user?: {
    userId: string;
    displayName: string;
    email: string;
    createdAt?: Date;
  };

  @ApiProperty({
    description: 'Token payload wrapper',
  })
  data: {
    token: string;
    accessToken: string;
    refreshToken: string;
    user?: {
      userId: string;
      displayName: string;
      email: string;
      createdAt?: Date;
    };
  };

  constructor(accessToken: string, refreshToken: string, user?: User) {
    this.accessToken = accessToken;
    this.token = accessToken;
    this.refreshToken = refreshToken;

    if (user) {
      this.user = {
        userId: user.userId,
        displayName: user.displayName,
        email: user.email,
        createdAt: user.createdAt,
      };
    }

    this.data = {
      token: accessToken,
      accessToken,
      refreshToken,
      ...(this.user ? { user: this.user } : {}),
    };
  }
}

import { ApiProperty } from '@nestjs/swagger';

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
    description: 'Token payload wrapper',
  })
  data: {
    token: string;
    accessToken: string;
  };

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.token = accessToken;
    this.data = {
      token: accessToken,
      accessToken,
    };
  }
}

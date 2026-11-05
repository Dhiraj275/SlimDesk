import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

export class ClientAcceptDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Name of person authorizing acceptance',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'john@acme.com',
    description: 'Email of person authorizing acceptance',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    example: 'Approved as discussed. Let us get started next week.',
    description: 'Optional acceptance notes',
  })
  @IsOptional()
  @IsString()
  comments?: string;
}

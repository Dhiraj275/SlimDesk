import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateContactDto {
  @ApiPropertyOptional({
    example: 'Acme Studio Ltd',
    description: 'Updated name of the contact or business',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({
    example: 'newcontact@acmestudio.com',
    description: 'Updated email address',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    example: '+1 (555) 987-6543',
    description: 'Updated phone number',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({
    example: 'Acme Holdings Inc.',
    description: 'Updated company or organization',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  company?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Updated client status',
  })
  @IsOptional()
  @IsBoolean()
  isClient?: boolean;
}

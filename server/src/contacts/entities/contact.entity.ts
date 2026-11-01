import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('contacts')
export class Contact {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    description: 'Unique contact identifier (UUID v4)',
  })
  @PrimaryGeneratedColumn('uuid')
  contactId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Freelancer owner user identifier',
  })
  @Index()
  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ApiProperty({
    example: 'Acme Studio',
    description: 'Name of the contact person or business',
  })
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ApiPropertyOptional({
    example: 'hello@acmestudio.com',
    description: 'Primary contact email address',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @ApiPropertyOptional({
    example: '+1 (555) 234-5678',
    description: 'Contact phone number',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @ApiPropertyOptional({
    example: 'Acme Studio Inc.',
    description: 'Associated company or organization name',
  })
  @Column({ type: 'varchar', length: 150, nullable: true })
  company: string | null;

  @ApiProperty({
    example: false,
    description: 'Whether this contact is an active paying client',
  })
  @Column({ type: 'boolean', default: false })
  isClient: boolean;

  @ApiProperty({
    example: '2026-11-01T14:00:00.000Z',
    description: 'Contact creation timestamp',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    example: '2026-11-01T14:30:00.000Z',
    description: 'Last update timestamp',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

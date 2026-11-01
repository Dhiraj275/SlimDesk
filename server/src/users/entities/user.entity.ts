import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../auth/enums/role.enum.js';

@Entity('users')
export class User {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique user identifier (UUID v4)',
  })
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @ApiProperty({
    example: 'Alice Johnson',
    description: 'User display name',
  })
  @Column({ type: 'varchar', length: 100 })
  displayName: string;

  @ApiProperty({
    example: 'alice@example.com',
    description: 'Unique email address of user',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string;

  @ApiProperty({
    example: Role.USER,
    enum: Role,
    description: 'User permission role',
  })
  @Column({
    type: 'varchar',
    length: 20,
    default: Role.USER,
  })
  role: Role;

  @ApiProperty({
    example: '2026-11-01T12:00:00.000Z',
    description: 'Account creation timestamp',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

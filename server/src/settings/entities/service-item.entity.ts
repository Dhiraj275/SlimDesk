import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('service_items')
export class ServiceItem {
  @ApiProperty({
    example: 'c2f908e7-c3c6-43aa-abba-bc072ad8b59c',
    description: 'Unique catalog service UUID',
  })
  @PrimaryGeneratedColumn('uuid')
  serviceId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Owner user UUID',
  })
  @Index()
  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ApiProperty({
    example: 'Frontend Development (Next.js)',
    description: 'Deliverable or service title',
  })
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ApiPropertyOptional({
    example: 'Custom UI implementation with responsive Tailwind CSS & clean TypeScript components.',
    description: 'Standard scope and service description',
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    example: 'hour',
    description: 'Billing unit (hour, day, project, milestone, units)',
  })
  @Column({ type: 'varchar', length: 30, default: 'units' })
  unit: string;

  @ApiProperty({
    example: 3500.0,
    description: 'Default unit price in given currency',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  unitPrice: number;

  @ApiProperty({
    example: 'INR',
    description: 'Currency code',
  })
  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currency: string;

  @ApiProperty({
    example: 18.0,
    description: 'Default tax rate percentage for this service',
  })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.0 })
  taxRate: number;

  @ApiProperty({
    example: true,
    description: 'Whether service is active in builder selector',
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


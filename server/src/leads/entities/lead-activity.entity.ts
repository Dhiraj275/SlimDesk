import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '../enums/activity-type.enum.js';
import type { Lead } from './lead.entity.js';

@Entity('lead_activities')
export class LeadActivity {
  @ApiProperty({
    example: 'd9e8f7c6-b5a4-3210-fedc-ba9876543210',
    description: 'Unique activity identifier (UUID v4)',
  })
  @PrimaryGeneratedColumn('uuid')
  activityId: string;

  @ApiProperty({
    example: 'f13d3aba-edd3-464f-9e4e-2e9532b61966',
    description: 'Associated lead UUID identifier',
  })
  @Index()
  @Column({ type: 'varchar', length: 36 })
  leadId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Freelancer user UUID identifier',
  })
  @Index()
  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ApiProperty({
    example: ActivityType.CALL,
    enum: ActivityType,
    description: 'Classification of activity event',
  })
  @Column({
    type: 'varchar',
    length: 50,
    default: ActivityType.NOTE,
  })
  type: ActivityType;

  @ApiProperty({
    example: 'Discussed project scope with CTO',
    description: 'Activity event summary or title',
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiPropertyOptional({
    example: 'Reviewed technical architecture and deliverables. Agreed to submit proposal by Friday.',
    description: 'Detailed activity description, notes, or agenda',
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiPropertyOptional({
    example: { durationMinutes: 30, outcome: 'positive' },
    description: 'Arbitrary structured metadata specific to the event',
  })
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any> | null;

  @ApiProperty({
    example: '2026-11-01T15:00:00.000Z',
    description: 'Timestamp when the activity actually occurred',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  performedAt: Date;

  @ApiProperty({
    example: '2026-11-01T15:05:00.000Z',
    description: 'Record creation timestamp in database',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne('Lead', (lead: Lead) => lead.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;
}

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
import type { Lead } from './lead.entity.js';

@Entity('lead_followups')
export class LeadFollowUp {
  @ApiProperty({
    example: 'ca26b897-fbf4-49c2-9c2d-a4f7423931b8',
    description: 'Unique follow-up identifier (UUID v4)',
  })
  @PrimaryGeneratedColumn('uuid')
  followUpId: string;

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
    example: '2026-11-05T15:00:00.000Z',
    description: 'Scheduled due date and time for the follow-up',
  })
  @Column({ type: 'timestamp' })
  dueDate: Date;

  @ApiPropertyOptional({
    example: 'Client wanted to discuss the quotation with their business partner before confirming.',
    description: 'Follow-up contextual notes or reminder text',
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({
    example: false,
    description: 'Whether this follow-up has been marked as completed',
  })
  @Column({ type: 'boolean', default: false })
  isCompleted: boolean;

  @ApiPropertyOptional({
    example: '2026-11-05T16:00:00.000Z',
    description: 'Timestamp when follow-up was marked completed',
  })
  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @ApiProperty({
    example: '2026-11-01T15:00:00.000Z',
    description: 'Record creation timestamp',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne('Lead', (lead: Lead) => lead.followUps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;
}

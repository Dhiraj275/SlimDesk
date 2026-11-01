import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadStatus } from '../enums/lead-status.enum.js';
import { LeadSource } from '../enums/lead-source.enum.js';
import { LeadActivity } from './lead-activity.entity.js';
import { LeadFollowUp } from './lead-followup.entity.js';
import { Contact } from '../../contacts/entities/contact.entity.js';

@Entity('leads')
export class Lead {
  @ApiProperty({
    example: 'f13d3aba-edd3-464f-9e4e-2e9532b61966',
    description: 'Unique lead opportunity UUID identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  leadId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Freelancer user UUID identifier',
  })
  @Index()
  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ApiPropertyOptional({
    example: 'baf908e7-a1a6-43aa-abba-bc072ad8b59b',
    description: 'Associated reusable contact UUID',
  })
  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  contactId: string | null;

  @ApiProperty({
    example: 'Website Redesign',
    description: 'Lead or opportunity title',
  })
  @Column({ type: 'varchar', length: 150 })
  title: string;

  @ApiProperty({
    example: 'Acme Studio',
    description: 'Contact or business name',
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
    example: '+1 (555) 345-6789',
    description: 'Primary contact phone number',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @ApiPropertyOptional({
    example: 'Acme Studio Inc.',
    description: 'Company or organization',
  })
  @Column({ type: 'varchar', length: 150, nullable: true })
  company: string | null;

  @ApiProperty({
    example: LeadSource.WEBSITE,
    enum: LeadSource,
    description: 'Lead acquisition source',
  })
  @Column({
    type: 'varchar',
    length: 50,
    default: LeadSource.OTHER,
  })
  source: LeadSource;

  @ApiPropertyOptional({
    example: 'Full-stack Web Application',
    description: 'Specific service or deliverable the lead requested',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  interestedService: string | null;

  @ApiPropertyOptional({
    example: 25000,
    description: 'Estimated budget figure',
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  estimatedBudget: number | null;

  @ApiProperty({
    example: 'USD',
    description: 'Budget currency code (e.g. USD, EUR, INR)',
  })
  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @ApiProperty({
    example: LeadStatus.NEW,
    enum: LeadStatus,
    description: 'Current pipeline stage or terminal outcome',
  })
  @Column({
    type: 'varchar',
    length: 50,
    default: LeadStatus.NEW,
  })
  status: LeadStatus;

  @ApiProperty({
    example: false,
    description: 'Simple qualification evaluation flag',
  })
  @Column({ type: 'boolean', default: false })
  isQualified: boolean;

  @ApiPropertyOptional({
    example: 'Client is looking for a modern platform revamp by Q1.',
    description: 'Requirements notes or lead inquiry background',
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiPropertyOptional({
    example: 'Selected an internal alternative due to budget freeze.',
    description: 'Explanation if the opportunity was marked as lost',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  lostReason: string | null;

  @ApiPropertyOptional({
    example: '2026-11-05T10:00:00.000Z',
    description: 'Next scheduled follow-up due date',
  })
  @Column({ type: 'timestamp', nullable: true })
  nextFollowUpDate: Date | null;

  @ApiPropertyOptional({
    example: '2026-11-01T14:30:00.000Z',
    description: 'Timestamp of last contact with this lead',
  })
  @Column({ type: 'timestamp', nullable: true })
  lastContactedDate: Date | null;

  @ApiProperty({
    example: '2026-11-01T12:00:00.000Z',
    description: 'Lead capture timestamp',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    example: '2026-11-01T15:30:00.000Z',
    description: 'Lead last update timestamp',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: () => Contact,
    description: 'Associated reusable contact record',
  })
  @ManyToOne(() => Contact, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'contactId' })
  contact: Contact | null;

  @ApiPropertyOptional({
    type: () => [LeadActivity],
    description: 'Chronological timeline of activities on this lead',
  })
  @OneToMany(() => LeadActivity, (activity) => activity.lead, { cascade: true })
  activities: LeadActivity[];

  @ApiPropertyOptional({
    type: () => [LeadFollowUp],
    description: 'Scheduled follow-ups associated with this lead',
  })
  @OneToMany(() => LeadFollowUp, (followUp) => followUp.lead, { cascade: true })
  followUps: LeadFollowUp[];
}

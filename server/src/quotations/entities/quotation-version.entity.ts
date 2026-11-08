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
import type { Quotation } from './quotation.entity.js';

@Entity('quotation_versions')
export class QuotationVersion {
  @ApiProperty({
    example: 'd82fb183-109e-4c74-9f43-a618f0296ee9',
    description: 'Unique version record UUID identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  versionId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    description: 'Quotation UUID identifier',
  })
  @Index()
  @Column({ type: 'varchar', length: 36 })
  quotationId: string;

  @ApiProperty({
    example: 1,
    description: 'Sequential version number snapshot (1, 2, 3...)',
  })
  @Column({ type: 'int' })
  versionNumber: number;

  @ApiProperty({
    example: { totalAmount: 25000, items: [] },
    description: 'Full immutable JSON snapshot of quotation at that revision point',
  })
  @Column({ type: 'json' })
  snapshot: Record<string, any>;

  @ApiPropertyOptional({
    example: 'Initial proposal sent to client',
    description: 'Reason or summary of changes in this version',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  changeSummary: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne('Quotation', 'versions', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotationId' })
  quotation?: Quotation;
}

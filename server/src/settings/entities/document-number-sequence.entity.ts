import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '../enums/document-type.enum.js';
import { YearFormat } from '../enums/year-format.enum.js';

@Entity('document_number_sequences')
@Unique('unique_user_doc_type', ['userId', 'documentType'])
export class DocumentNumberSequence {
  @ApiProperty({
    example: 'e4f908e7-e5d6-43aa-abba-bc072ad8b59e',
    description: 'Unique sequence config UUID',
  })
  @PrimaryGeneratedColumn('uuid')
  sequenceId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Owner user UUID',
  })
  @Index()
  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ApiProperty({
    enum: DocumentType,
    example: DocumentType.INVOICE,
    description: 'Document category (quotation, invoice, receipt)',
  })
  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @ApiProperty({
    example: 'INV-',
    description: 'Custom alphanumeric prefix (e.g. INV-, QT-, RCT-)',
  })
  @Column({ type: 'varchar', length: 20 })
  prefix: string;

  @ApiProperty({
    enum: YearFormat,
    example: YearFormat.YYYY,
    description: 'Year segment inclusion in sequence (YYYY, YY, NONE)',
  })
  @Column({
    type: 'enum',
    enum: YearFormat,
    default: YearFormat.YYYY,
  })
  yearFormat: YearFormat;

  @ApiProperty({
    example: 1,
    description: 'Next incremental sequence number',
  })
  @Column({ type: 'int', default: 1 })
  nextNumber: number;

  @ApiProperty({
    example: 3,
    description: 'Number of zero-padded digits (e.g. 3 -> 001, 4 -> 0001)',
  })
  @Column({ type: 'int', default: 3 })
  paddingDigits: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


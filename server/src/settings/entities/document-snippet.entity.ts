import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentSnippetType } from '../enums/document-snippet-type.enum.js';

@Entity('document_snippets')
export class DocumentSnippet {
  @ApiProperty({
    example: 'd3f908e7-d4d6-43aa-abba-bc072ad8b59d',
    description: 'Unique snippet UUID',
  })
  @PrimaryGeneratedColumn('uuid')
  snippetId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Owner user UUID',
  })
  @Index()
  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ApiProperty({
    example: 'Standard Web Development Terms',
    description: 'Label or title for this reusable snippet',
  })
  @Column({ type: 'varchar', length: 150 })
  title: string;

  @ApiProperty({
    enum: DocumentSnippetType,
    example: DocumentSnippetType.TERMS,
    description: 'Snippet category (terms, notes, payment_terms)',
  })
  @Column({
    type: 'enum',
    enum: DocumentSnippetType,
    default: DocumentSnippetType.TERMS,
  })
  type: DocumentSnippetType;

  @ApiProperty({
    example:
      '1. Quotation is valid for 14 days from date of issue.\n2. Work commences upon receipt of 50% advance deposit.\n3. Final delivery released upon invoice clearance.',
    description: 'Content text of the snippet',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({
    example: true,
    description: 'Whether this snippet is automatically prefilled in new documents',
  })
  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


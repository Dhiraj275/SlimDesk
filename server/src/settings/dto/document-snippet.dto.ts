import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { DocumentSnippetType } from '../enums/document-snippet-type.enum.js';

export class CreateDocumentSnippetDto {
  @ApiProperty({
    example: 'Standard Development Terms',
    description: 'Title of the snippet',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    enum: DocumentSnippetType,
    example: DocumentSnippetType.TERMS,
    description: 'Category (terms, notes, payment_terms)',
  })
  @IsEnum(DocumentSnippetType)
  type: DocumentSnippetType;

  @ApiProperty({
    example:
      '1. Quotation is valid for 14 days from date of issue.\n2. Work commences upon receipt of initial deposit.',
    description: 'Body content of snippet',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateDocumentSnippetDto {
  @ApiPropertyOptional({ example: 'Standard Terms' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ enum: DocumentSnippetType })
  @IsOptional()
  @IsEnum(DocumentSnippetType)
  type?: DocumentSnippetType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}


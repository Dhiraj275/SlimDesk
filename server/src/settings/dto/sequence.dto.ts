import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { YearFormat } from '../enums/year-format.enum.js';

export class UpdateSequenceDto {
  @ApiPropertyOptional({ example: 'INV-' })
  @IsOptional()
  @IsString()
  prefix?: string;

  @ApiPropertyOptional({ enum: YearFormat, example: YearFormat.YYYY })
  @IsOptional()
  @IsEnum(YearFormat)
  yearFormat?: YearFormat;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  nextNumber?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(8)
  paddingDigits?: number;
}


import { PartialType } from '@nestjs/swagger';
import { CreateQuotationDto } from './create-quotation.dto.js';

export class UpdateQuotationDto extends PartialType(CreateQuotationDto) {}

import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { InvoicesService } from '../services/invoices.service.js';
import { InvoiceResponseDto } from '../dto/invoice-response.dto.js';

@ApiTags('Public Invoices')
@Controller('invoices/public')
export class PublicInvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get(':token')
  @ApiOperation({
    summary: 'View public invoice via secure token',
    description:
      'Unauthenticated client portal endpoint for invoice review. Viewing an issued invoice automatically records a client viewed timestamp and timeline event.',
  })
  @ApiParam({ name: 'token', description: 'Unique unguessable public invoice token' })
  @ApiResponse({ status: 200, description: 'Public invoice details', type: InvoiceResponseDto })
  @ApiResponse({ status: 404, description: 'Invoice not found or link is invalid' })
  findByPublicToken(
    @Param('token') token: string,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.findByPublicToken(token);
  }
}


import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InvoicesService } from '../services/invoices.service.js';
import { PaymentReceipt } from '../entities/payment-receipt.entity.js';

@ApiTags('Public Receipts')
@Controller('receipts/public')
export class PublicReceiptsController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get(':token')
  @ApiOperation({
    summary: 'View public payment receipt via token',
    description:
      'Unauthenticated client portal endpoint for viewing an official payment acknowledgement and receipt. Automatically records viewedAt timestamp upon first client access.',
  })
  @ApiParam({ name: 'token', description: 'Unique unguessable public receipt token' })
  @ApiResponse({ status: 200, type: PaymentReceipt })
  @ApiResponse({ status: 404, description: 'Receipt not found or link has expired' })
  findByPublicToken(@Param('token') token: string): Promise<PaymentReceipt> {
    return this.invoicesService.findByPublicReceiptToken(token);
  }
}


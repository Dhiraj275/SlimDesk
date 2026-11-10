import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InvoicesService } from '../services/invoices.service.js';
import { PaymentReceipt } from '../entities/payment-receipt.entity.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { User } from '../../users/entities/user.entity.js';

@ApiTags('Receipts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({
    summary: 'List all payment receipts',
    description: 'Returns all issued payment receipts for the authenticated freelancer.',
  })
  @ApiResponse({ status: 200, type: [PaymentReceipt] })
  getAllReceipts(@CurrentUser() user: User): Promise<PaymentReceipt[]> {
    return this.invoicesService.getAllReceipts(user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get payment receipt details by UUID',
    description: 'Retrieves a single payment receipt by its identifier.',
  })
  @ApiParam({ name: 'id', description: 'Payment receipt UUID' })
  @ApiResponse({ status: 200, type: PaymentReceipt })
  @ApiResponse({ status: 404, description: 'Receipt not found' })
  getReceiptById(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<PaymentReceipt> {
    return this.invoicesService.getReceiptById(user.userId, id);
  }
}


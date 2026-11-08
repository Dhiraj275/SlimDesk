import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
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
import { CreateInvoiceDto } from '../dto/create-invoice.dto.js';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto.js';
import { RecordPaymentDto } from '../dto/record-payment.dto.js';
import { RecordRefundDto } from '../dto/record-refund.dto.js';
import { SendInvoiceDto } from '../dto/send-invoice.dto.js';
import { SendReminderDto } from '../dto/send-reminder.dto.js';
import { CancelInvoiceDto } from '../dto/cancel-invoice.dto.js';
import { InvoiceFilterQueryDto } from '../dto/invoice-filter-query.dto.js';
import {
  InvoiceResponseDto,
  InvoiceMetricsDto,
} from '../dto/invoice-response.dto.js';
import { InvoicePayment } from '../entities/invoice-payment.entity.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { User } from '../../users/entities/user.entity.js';

@ApiTags('Invoices')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new invoice',
    description:
      'Creates a new draft invoice with auto-calculated subtotals, tax (optional), and totals.',
  })
  @ApiResponse({ status: 201, description: 'Invoice created successfully', type: InvoiceResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.create(user.userId, dto);
  }

  @Post('from-quotation/:quotationId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Convert accepted quotation into invoice draft',
    description:
      'Copies line items, pricing, tax configuration, and client details from an accepted quotation into a new draft invoice for freelancer review.',
  })
  @ApiParam({ name: 'quotationId', description: 'Originating Quotation UUID' })
  @ApiResponse({ status: 201, description: 'Invoice draft generated from quotation', type: InvoiceResponseDto })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  createFromQuotation(
    @CurrentUser() user: User,
    @Param('quotationId') quotationId: string,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.createFromQuotation(user.userId, quotationId);
  }

  @Get()
  @ApiOperation({
    summary: 'List invoices with filters and pagination',
    description:
      'Retrieve invoices with derived payment statuses (unpaid, partially_paid, paid, overdue, refunded).',
  })
  @ApiResponse({ status: 200, description: 'List of invoices' })
  findAll(
    @CurrentUser() user: User,
    @Query() query: InvoiceFilterQueryDto,
  ) {
    return this.invoicesService.findAll(user.userId, query);
  }

  @Get('metrics')
  @ApiOperation({
    summary: 'Get invoice revenue & receivables metrics',
    description:
      'Aggregates total invoiced, total collected/received, outstanding balances, and overdue amounts.',
  })
  @ApiResponse({ status: 200, description: 'Invoice metrics summary', type: InvoiceMetricsDto })
  getMetrics(@CurrentUser() user: User): Promise<InvoiceMetricsDto> {
    return this.invoicesService.getMetrics(user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get detailed invoice',
    description:
      'Returns invoice with line items, payments history, chronological audit events, and computed payment status.',
  })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'Invoice details', type: InvoiceResponseDto })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.findOne(user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update draft invoice',
    description:
      'Updates line items and details on draft invoices. Issued or cancelled invoices are immutable and will be rejected with 400 Bad Request.',
  })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'Invoice updated', type: InvoiceResponseDto })
  @ApiResponse({ status: 400, description: 'Cannot modify issued or cancelled invoice' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.update(user.userId, id, dto);
  }

  @Post(':id/issue')
  @ApiOperation({
    summary: 'Finalize and issue invoice',
    description:
      'Locks the invoice from future edits, transitions status to issued, and records issuance timestamp and timeline event.',
  })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'Invoice issued', type: InvoiceResponseDto })
  issue(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.issue(user.userId, id);
  }

  @Post(':id/send')
  @ApiOperation({
    summary: 'Send invoice to client',
    description:
      'Dispatches invoice link to client, auto-issues draft invoices, and logs timeline event.',
  })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'Invoice sent', type: InvoiceResponseDto })
  send(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: SendInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.send(user.userId, id, dto);
  }

  @Get(':id/pdf')
  @ApiOperation({
    summary: 'Get printable invoice data for PDF generation',
  })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  getPdfData(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.findOne(user.userId, id);
  }

  @Post(':id/payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Record manual payment on invoice',
    description:
      'Records cash, bank transfer, UPI, or other payment. Automatically validates amount against outstanding balance and updates payment status.',
  })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 201, description: 'Payment recorded successfully' })
  @ApiResponse({ status: 400, description: 'Invoice not issued or amount exceeds balance' })
  recordPayment(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
  ): Promise<{ payment: InvoicePayment; invoice: InvoiceResponseDto }> {
    return this.invoicesService.recordPayment(user.userId, id, dto);
  }

  @Get(':id/payments')
  @ApiOperation({
    summary: 'Get payment transaction history for invoice',
  })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'List of payment transactions', type: [InvoicePayment] })
  getPayments(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<InvoicePayment[]> {
    return this.invoicesService.getPayments(user.userId, id);
  }

  @Post(':id/refund')
  @ApiOperation({
    summary: 'Record payment refund',
    description:
      'Marks a completed payment transaction as refunded, recalculates outstanding balance, and logs audit event.',
  })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'Refund processed', type: InvoiceResponseDto })
  @ApiResponse({ status: 400, description: 'Payment already refunded' })
  recordRefund(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: RecordRefundDto,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.recordRefund(user.userId, id, dto);
  }

  @Post(':id/remind')
  @ApiOperation({
    summary: 'Send payment reminder',
    description:
      'Dispatches payment reminder for overdue or unpaid invoice, updates reminder count, and logs event.',
  })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'Reminder recorded and sent' })
  remind(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: SendReminderDto,
  ) {
    return this.invoicesService.remind(user.userId, id, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({
    summary: 'Cancel / void invoice',
    description:
      'Cancels an unpaid invoice. Rejects cancellation if active un-refunded payments exist.',
  })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'Invoice cancelled', type: InvoiceResponseDto })
  @ApiResponse({ status: 400, description: 'Cannot cancel invoice with completed payments' })
  cancel(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CancelInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.cancel(user.userId, id, dto);
  }
}


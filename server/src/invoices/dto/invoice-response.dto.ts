import { ApiProperty } from '@nestjs/swagger';
import { Invoice } from '../entities/invoice.entity.js';
import { PaymentStatus } from '../enums/payment-status.enum.js';

export class InvoiceResponseDto extends Invoice {
  @ApiProperty({
    example: 25000.0,
    description: 'Total amount collected through valid completed payments',
  })
  paidAmount: number;

  @ApiProperty({
    example: 28100.0,
    description: 'Remaining outstanding balance to be paid',
  })
  outstandingAmount: number;

  @ApiProperty({
    example: 0.0,
    description: 'Total amount refunded to client',
  })
  refundedAmount: number;

  @ApiProperty({
    enum: PaymentStatus,
    example: PaymentStatus.PARTIALLY_PAID,
    description: 'Derived payment status (unpaid, partially_paid, paid, overdue, refunded)',
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    example: false,
    description: 'Whether the invoice is past its due date with an outstanding balance',
  })
  isOverdue: boolean;

  @ApiProperty({
    example: 47.08,
    description: 'Percentage of the total invoice amount that has been paid',
  })
  paymentPercentage: number;

  @ApiProperty({
    example: 7,
    description: 'Days past the invoice payment due date',
  })
  daysOverdue: number;

  @ApiProperty({
    example: '1-7',
    description: 'Overdue aging bucket: current, 1-7, 8-30, 31-60, 60+',
  })
  agingBucket: string;

  @ApiProperty({
    example: 'Overdue by 7 days',
    description: 'Human-readable visual aging description (e.g. Due in 5 days, Overdue by 7 days)',
  })
  agingLabel: string;
}

export class OverdueAgingBucketDto {
  @ApiProperty({ example: 2, description: 'Number of invoices in this aging bucket' })
  count: number;

  @ApiProperty({ example: 25000, description: 'Total outstanding amount in this aging bucket' })
  amount: number;
}

export class OverdueAgingBreakdownDto {
  @ApiProperty({ type: OverdueAgingBucketDto, description: 'Not yet overdue' })
  current: OverdueAgingBucketDto;

  @ApiProperty({ type: OverdueAgingBucketDto, description: 'Overdue by 1 to 7 days' })
  days1to7: OverdueAgingBucketDto;

  @ApiProperty({ type: OverdueAgingBucketDto, description: 'Overdue by 8 to 30 days' })
  days8to30: OverdueAgingBucketDto;

  @ApiProperty({ type: OverdueAgingBucketDto, description: 'Overdue by 31 to 60 days' })
  days31to60: OverdueAgingBucketDto;

  @ApiProperty({ type: OverdueAgingBucketDto, description: 'Overdue by more than 60 days' })
  days60plus: OverdueAgingBucketDto;
}

export class InvoiceMetricsDto {
  @ApiProperty({ example: 240000, description: 'Total revenue invoiced' })
  totalInvoiced: number;

  @ApiProperty({ example: 180000, description: 'Total revenue collected/received' })
  totalReceived: number;

  @ApiProperty({ example: 60000, description: 'Total outstanding balance receivable' })
  totalOutstanding: number;

  @ApiProperty({ example: 15000, description: 'Total overdue amount past due date' })
  totalOverdue: number;

  @ApiProperty({ example: 12, description: 'Total invoice count' })
  totalCount: number;

  @ApiProperty({ example: 3, description: 'Draft invoices count' })
  draftCount: number;

  @ApiProperty({ example: 8, description: 'Issued invoices count' })
  issuedCount: number;

  @ApiProperty({ example: 1, description: 'Cancelled invoices count' })
  cancelledCount: number;

  @ApiProperty({ example: 2, description: 'Overdue invoices count' })
  overdueCount: number;

  @ApiProperty({ example: 5, description: 'Fully paid invoices count' })
  paidCount: number;

  @ApiProperty({ example: 2, description: 'Partially paid invoices count' })
  partiallyPaidCount: number;

  @ApiProperty({ example: 1, description: 'Unpaid invoices count' })
  unpaidCount: number;

  @ApiProperty({
    type: OverdueAgingBreakdownDto,
    description: 'Visual aging analysis across current and overdue time buckets',
  })
  overdueAgingBreakdown: OverdueAgingBreakdownDto;
}

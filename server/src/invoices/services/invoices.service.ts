import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { Decimal } from 'decimal.js';
import { Invoice } from '../entities/invoice.entity.js';
import { InvoiceItem } from '../entities/invoice-item.entity.js';
import { InvoicePayment } from '../entities/invoice-payment.entity.js';
import { InvoiceEvent } from '../entities/invoice-event.entity.js';
import { PaymentReceipt } from '../entities/payment-receipt.entity.js';
import { InvoiceStatus } from '../enums/invoice-status.enum.js';
import { PaymentStatus } from '../enums/payment-status.enum.js';
import { PaymentRecordStatus } from '../enums/payment-record-status.enum.js';
import { InvoiceEventType } from '../enums/invoice-event-type.enum.js';
import { TaxMode } from '../../quotations/enums/tax-mode.enum.js';
import { Quotation } from '../../quotations/entities/quotation.entity.js';
import { QuotationStatus } from '../../quotations/enums/quotation-status.enum.js';
import { QuotationInvoiceAllocation } from '../../quotations/entities/quotation-invoice-allocation.entity.js';
import { ConversionBillingType } from '../../quotations/enums/conversion-billing-type.enum.js';
import { SettingsService } from '../../settings/services/settings.service.js';
import { DocumentType } from '../../settings/enums/document-type.enum.js';
import {
  InvoiceCalculatorService,
  ComputedPaymentState,
} from './invoice-calculator.service.js';
import { InvoiceNumberService } from './invoice-number.service.js';
import { CreateInvoiceDto } from '../dto/create-invoice.dto.js';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto.js';
import { ConvertQuotationDto } from '../dto/convert-quotation.dto.js';
import { GenerateReceiptDto } from '../dto/generate-receipt.dto.js';
import { RecordPaymentDto } from '../dto/record-payment.dto.js';
import { RecordRefundDto } from '../dto/record-refund.dto.js';
import { SendInvoiceDto } from '../dto/send-invoice.dto.js';
import { SendReminderDto } from '../dto/send-reminder.dto.js';
import { CancelInvoiceDto } from '../dto/cancel-invoice.dto.js';
import { InvoiceFilterQueryDto } from '../dto/invoice-filter-query.dto.js';
import {
  InvoiceResponseDto,
  InvoiceMetricsDto,
  OverdueAgingBreakdownDto,
} from '../dto/invoice-response.dto.js';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly itemRepository: Repository<InvoiceItem>,
    @InjectRepository(InvoicePayment)
    private readonly paymentRepository: Repository<InvoicePayment>,
    @InjectRepository(InvoiceEvent)
    private readonly eventRepository: Repository<InvoiceEvent>,
    @InjectRepository(Quotation)
    private readonly quotationRepository: Repository<Quotation>,
    @InjectRepository(QuotationInvoiceAllocation)
    private readonly allocationRepository: Repository<QuotationInvoiceAllocation>,
    @InjectRepository(PaymentReceipt)
    private readonly receiptRepository: Repository<PaymentReceipt>,
    private readonly calculator: InvoiceCalculatorService,
    private readonly numberService: InvoiceNumberService,
    @Optional()
    private readonly settingsService?: SettingsService,
  ) {}

  async create(userId: string, dto: CreateInvoiceDto): Promise<InvoiceResponseDto> {
    const invoiceNumber = await this.numberService.generateNextNumber(
      userId,
      dto.issueDate,
    );
    const publicToken = randomUUID();

    const calculation = this.calculator.calculate({
      items: dto.items,
      taxMode: dto.taxMode || TaxMode.NONE,
      discountAmount: dto.discountAmount,
      freelancerState: dto.freelancerInfo?.state,
      clientState: dto.clientInfo?.state,
    });

    const invoice = this.invoiceRepository.create({
      userId,
      invoiceNumber,
      title: dto.title,
      contactId: dto.contactId || null,
      quotationId: dto.quotationId || null,
      currency: dto.currency || 'INR',
      issueDate: dto.issueDate,
      dueDate: dto.dueDate,
      status: InvoiceStatus.DRAFT,
      subtotal: calculation.subtotal,
      discountAmount: calculation.discountAmount,
      taxAmount: calculation.taxAmount,
      totalAmount: calculation.totalAmount,
      taxMode: calculation.taxMode,
      taxDetails: calculation.taxDetails,
      freelancerInfo: dto.freelancerInfo,
      clientInfo: dto.clientInfo,
      paymentDetails: dto.paymentDetails || null,
      terms: dto.terms || null,
      notes: dto.notes || null,
      publicToken,
      reminderCount: 0,
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    const items = calculation.items.map((item, index) =>
      this.itemRepository.create({
        invoiceId: savedInvoice.invoiceId,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        discountAmount: item.discountAmount,
        taxRate: item.taxRate,
        taxAmount: item.taxAmount,
        totalAmount: item.totalAmount,
        sortOrder: item.sortOrder ?? index,
      }),
    );

    await this.itemRepository.save(items);
    savedInvoice.items = items;
    savedInvoice.payments = [];
    savedInvoice.events = [];

    await this.logEvent(
      savedInvoice.invoiceId,
      InvoiceEventType.CREATED,
      `Draft invoice ${savedInvoice.invoiceNumber} created for ${savedInvoice.clientInfo?.name || 'client'}`,
      { totalAmount: savedInvoice.totalAmount },
    );

    return this.decorateInvoice(savedInvoice);
  }

  async createFromQuotation(
    userId: string,
    quotationId: string,
    dto?: ConvertQuotationDto,
  ): Promise<InvoiceResponseDto> {
    const quotation = await this.quotationRepository.findOne({
      where: { quotationId, userId },
      relations: { items: true },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation ${quotationId} not found`);
    }

    if (
      quotation.status === QuotationStatus.REJECTED ||
      quotation.status === QuotationStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot create invoice from quotation in ${quotation.status} state`,
      );
    }

    const totalQuotationAmount = new Decimal(
      quotation.totalAmount ||
        quotation.items?.reduce(
          (s, it) =>
            s + Number(it.unitPrice || 0) * Number(it.quantity || 1),
          0,
        ) ||
        0,
    );

    const existingAllocations = await this.allocationRepository.find({
      where: { quotationId, userId },
    });

    const totalAlreadyInvoiced = existingAllocations.reduce(
      (acc, a) => acc.add(new Decimal(a.allocatedAmount || 0)),
      new Decimal(0),
    );

    const remainingBillable = Decimal.max(
      0,
      totalQuotationAmount.sub(totalAlreadyInvoiced),
    );

    if (remainingBillable.isZero()) {
      throw new BadRequestException('Quotation has already been fully invoiced');
    }

    const billingType = dto?.billingType || ConversionBillingType.FULL;
    let billAmount: Decimal;
    let allocationPercentage: number | null = null;

    if (billingType === ConversionBillingType.FULL) {
      billAmount = remainingBillable;
      allocationPercentage = totalQuotationAmount.gt(0)
        ? remainingBillable
            .div(totalQuotationAmount)
            .mul(100)
            .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
            .toNumber()
        : 100;
    } else if (billingType === ConversionBillingType.PERCENTAGE) {
      const pct = Number(dto?.percentage);
      if (!pct || pct <= 0 || pct > 100) {
        throw new BadRequestException(
          'Percentage must be between 0.01 and 100',
        );
      }
      allocationPercentage = pct;
      billAmount = totalQuotationAmount
        .mul(pct)
        .div(100)
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    } else if (billingType === ConversionBillingType.CUSTOM) {
      const customAmt = Number(dto?.customAmount);
      if (!customAmt || customAmt <= 0) {
        throw new BadRequestException(
          'Custom amount must be greater than 0',
        );
      }
      billAmount = new Decimal(customAmt).toDecimalPlaces(
        2,
        Decimal.ROUND_HALF_UP,
      );
      allocationPercentage = totalQuotationAmount.gt(0)
        ? billAmount
            .div(totalQuotationAmount)
            .mul(100)
            .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
            .toNumber()
        : null;
    } else {
      throw new BadRequestException(`Unsupported billing type: ${billingType}`);
    }

    if (billAmount.gt(remainingBillable)) {
      throw new BadRequestException(
        `Requested billing amount (${billAmount.toFixed(2)}) exceeds remaining billable quotation balance (${remainingBillable.toFixed(2)})`,
      );
    }

    const isFullInitialInvoice =
      billingType === ConversionBillingType.FULL &&
      totalAlreadyInvoiced.isZero();
    let invoiceItems: CreateInvoiceDto['items'];
    let discountAmount = 0;
    let taxMode = TaxMode.NONE;

    if (
      isFullInitialInvoice &&
      quotation.items &&
      quotation.items.length > 0
    ) {
      invoiceItems = quotation.items.map((item, idx) => ({
        description: item.description,
        quantity: Number(item.quantity) || 1,
        unit: item.unit || 'units',
        unitPrice: Number(item.unitPrice) || 0,
        discountAmount: Number(item.discount) || 0,
        taxRate: Number(item.taxRate) || 0,
        sortOrder: item.sortOrder ?? idx,
      }));
      discountAmount = Number(quotation.discountAmount) || 0;
      taxMode = quotation.taxMode || TaxMode.NONE;
    } else {
      let lineDesc = dto?.notes;
      if (!lineDesc) {
        if (billingType === ConversionBillingType.PERCENTAGE) {
          lineDesc = `Advance payment (${dto?.percentage}%) for Quotation ${quotation.quotationNumber}: ${quotation.title || 'Services'}`;
        } else if (
          totalAlreadyInvoiced.gt(0) &&
          billAmount.equals(remainingBillable)
        ) {
          lineDesc = `Final balance payment for Quotation ${quotation.quotationNumber}: ${quotation.title || 'Services'}`;
        } else {
          lineDesc = `Milestone payment for Quotation ${quotation.quotationNumber}: ${quotation.title || 'Services'}`;
        }
      }
      invoiceItems = [
        {
          description: lineDesc,
          quantity: 1,
          unit: 'milestone',
          unitPrice: billAmount.toNumber(),
          discountAmount: 0,
          taxRate: 0,
          sortOrder: 0,
        },
      ];
      discountAmount = 0;
      taxMode = TaxMode.NONE;
    }

    let paymentDetails = quotation.paymentSchedule;
    if (dto?.paymentProfileId && this.settingsService) {
      try {
        const profiles = await this.settingsService.getPaymentProfiles(userId);
        const chosen = profiles.find(
          (p) => p.paymentProfileId === dto.paymentProfileId,
        );
        if (chosen) {
          if (chosen.type === 'upi') {
            paymentDetails = `UPI: ${chosen.details?.upiId || ''} (${chosen.details?.accountHolderName || ''})`;
          } else if (chosen.type === 'bank_transfer') {
            paymentDetails = `Bank: ${chosen.details?.bankName || ''} | A/C: ${chosen.details?.accountNumber || ''} | IFSC: ${chosen.details?.ifscCode || ''}`;
          } else if (chosen.details?.instructions) {
            paymentDetails = chosen.details.instructions;
          }
          if (chosen.instructions) {
            paymentDetails += `\n${chosen.instructions}`;
          }
        }
      } catch {
        // Fallback to quotation payment schedule
      }
    }

    const todayStr = dto?.issueDate || new Date().toISOString().split('T')[0];
    const dueDateStr =
      dto?.dueDate ||
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

    const invoiceDto: CreateInvoiceDto = {
      title: quotation.title || 'Services Rendered',
      contactId: quotation.contactId || undefined,
      quotationId: quotation.quotationId,
      currency: quotation.currency || 'INR',
      issueDate: todayStr,
      dueDate: dueDateStr,
      taxMode,
      discountAmount,
      freelancerInfo: quotation.freelancerInfo as any,
      clientInfo: quotation.clientInfo as any,
      paymentDetails:
        paymentDetails ||
        'Bank Transfer / UPI payment details will be provided.',
      terms:
        quotation.terms ||
        'Payment due within 14 days of invoice issuance. Late fee applies past due date.',
      notes:
        dto?.notes ||
        quotation.notes ||
        `Converted from quotation ${quotation.quotationNumber}.`,
      items: invoiceItems,
    };

    const invoice = await this.create(userId, invoiceDto);

    const allocation = this.allocationRepository.create({
      quotationId: quotation.quotationId,
      invoiceId: invoice.invoiceId,
      userId,
      allocatedAmount: billAmount.toNumber(),
      billingType,
      percentage: allocationPercentage,
      notes: dto?.notes || null,
    });
    await this.allocationRepository.save(allocation);

    const newTotalInvoiced = totalAlreadyInvoiced.add(billAmount);
    const newRemaining = Decimal.max(0, totalQuotationAmount.sub(newTotalInvoiced));

    if (newRemaining.isZero()) {
      quotation.status = QuotationStatus.CONVERTED;
      quotation.convertedAt = new Date();
    } else {
      quotation.status = QuotationStatus.ACCEPTED;
    }
    quotation.invoiceId = invoice.invoiceId;
    await this.quotationRepository.save(quotation);

    await this.logEvent(
      invoice.invoiceId,
      InvoiceEventType.CREATED,
      `Generated from quotation ${quotation.quotationNumber} (${billingType}: ${invoice.currency} ${billAmount.toNumber()})`,
      {
        quotationId: quotation.quotationId,
        quotationNumber: quotation.quotationNumber,
        billingType,
        allocatedAmount: billAmount.toNumber(),
      },
    );

    return invoice;
  }

  async findAll(
    userId: string,
    query: InvoiceFilterQueryDto,
  ): Promise<{ data: InvoiceResponseDto[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 20);

    const qb = this.invoiceRepository
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.items', 'items')
      .leftJoinAndSelect('i.payments', 'payments')
      .where('i.userId = :userId', { userId });

    if (query.invoiceStatus && query.invoiceStatus !== ('all' as any)) {
      qb.andWhere('i.status = :status', { status: query.invoiceStatus });
    }

    if (query.contactId) {
      qb.andWhere('i.contactId = :contactId', { contactId: query.contactId });
    }

    if (query.quotationId) {
      qb.andWhere('i.quotationId = :quotationId', { quotationId: query.quotationId });
    }

    if (query.search) {
      const search = `%${query.search.trim()}%`;
      qb.andWhere(
        '(i.title LIKE :search OR i.invoiceNumber LIKE :search OR JSON_UNQUOTE(JSON_EXTRACT(i.clientInfo, "$.name")) LIKE :search OR JSON_UNQUOTE(JSON_EXTRACT(i.clientInfo, "$.company")) LIKE :search)',
        { search },
      );
    }

    qb.orderBy('i.createdAt', 'DESC');

    const rawInvoices = await qb.getMany();
    let decorated = rawInvoices.map((inv) => this.decorateInvoice(inv));

    // Filter by computed paymentStatus if requested
    if (query.paymentStatus && query.paymentStatus !== ('all' as any)) {
      decorated = decorated.filter(
        (inv) => inv.paymentStatus === query.paymentStatus,
      );
    }

    const total = decorated.length;
    const paginated = decorated.slice((page - 1) * limit, page * limit);

    return {
      data: paginated,
      total,
      page,
      limit,
    };
  }

  async findOne(userId: string, invoiceId: string): Promise<InvoiceResponseDto> {
    const invoice = await this.invoiceRepository.findOne({
      where: { invoiceId, userId },
      relations: {
        items: true,
        payments: true,
        events: true,
      },
      order: {
        items: { sortOrder: 'ASC' },
        payments: { paymentDate: 'DESC' },
        events: { createdAt: 'DESC' },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    return this.decorateInvoice(invoice);
  }

  async getMetrics(userId: string): Promise<InvoiceMetricsDto> {
    const invoices = await this.invoiceRepository.find({
      where: { userId },
      relations: { payments: true },
    });

    const metrics: InvoiceMetricsDto = {
      totalInvoiced: 0,
      totalReceived: 0,
      totalOutstanding: 0,
      totalOverdue: 0,
      totalCount: invoices.length,
      draftCount: 0,
      issuedCount: 0,
      cancelledCount: 0,
      overdueCount: 0,
      paidCount: 0,
      partiallyPaidCount: 0,
      unpaidCount: 0,
      overdueAgingBreakdown: {
        current: { count: 0, amount: 0 },
        days1to7: { count: 0, amount: 0 },
        days8to30: { count: 0, amount: 0 },
        days31to60: { count: 0, amount: 0 },
        days60plus: { count: 0, amount: 0 },
      },
    };

    let totalInvoicedDec = new Decimal(0);
    let totalReceivedDec = new Decimal(0);
    let totalOutstandingDec = new Decimal(0);
    let totalOverdueDec = new Decimal(0);

    const aging: OverdueAgingBreakdownDto = {
      current: { count: 0, amount: 0 },
      days1to7: { count: 0, amount: 0 },
      days8to30: { count: 0, amount: 0 },
      days31to60: { count: 0, amount: 0 },
      days60plus: { count: 0, amount: 0 },
    };

    for (const inv of invoices) {
      const state = this.calculator.computePaymentState(
        inv.totalAmount,
        inv.dueDate,
        inv.status,
        inv.payments || [],
      );

      // Counts by document status
      if (inv.status === InvoiceStatus.DRAFT) metrics.draftCount += 1;
      if (inv.status === InvoiceStatus.ISSUED) metrics.issuedCount += 1;
      if (inv.status === InvoiceStatus.CANCELLED) metrics.cancelledCount += 1;

      // Only count non-cancelled invoices towards revenue & receivables
      if (inv.status !== InvoiceStatus.CANCELLED) {
        totalInvoicedDec = totalInvoicedDec.add(new Decimal(inv.totalAmount || 0));
        totalReceivedDec = totalReceivedDec.add(new Decimal(state.paidAmount || 0));

        if (inv.status === InvoiceStatus.ISSUED) {
          totalOutstandingDec = totalOutstandingDec.add(
            new Decimal(state.outstandingAmount || 0),
          );

          if (state.isOverdue) {
            totalOverdueDec = totalOverdueDec.add(
              new Decimal(state.outstandingAmount || 0),
            );
          }

          if (state.outstandingAmount > 0) {
            const outAmt = Number(state.outstandingAmount);
            if (state.agingBucket === 'current') {
              aging.current.count += 1;
              aging.current.amount = new Decimal(aging.current.amount).add(outAmt).toNumber();
            } else if (state.agingBucket === '1-7') {
              aging.days1to7.count += 1;
              aging.days1to7.amount = new Decimal(aging.days1to7.amount).add(outAmt).toNumber();
            } else if (state.agingBucket === '8-30') {
              aging.days8to30.count += 1;
              aging.days8to30.amount = new Decimal(aging.days8to30.amount).add(outAmt).toNumber();
            } else if (state.agingBucket === '31-60') {
              aging.days31to60.count += 1;
              aging.days31to60.amount = new Decimal(aging.days31to60.amount).add(outAmt).toNumber();
            } else if (state.agingBucket === '60+') {
              aging.days60plus.count += 1;
              aging.days60plus.amount = new Decimal(aging.days60plus.amount).add(outAmt).toNumber();
            }
          }
        }

        // Payment status counts
        if (state.paymentStatus === PaymentStatus.PAID) metrics.paidCount += 1;
        if (state.paymentStatus === PaymentStatus.PARTIALLY_PAID)
          metrics.partiallyPaidCount += 1;
        if (state.paymentStatus === PaymentStatus.OVERDUE) metrics.overdueCount += 1;
        if (state.paymentStatus === PaymentStatus.UNPAID) metrics.unpaidCount += 1;
      }
    }

    metrics.totalInvoiced = totalInvoicedDec.toNumber();
    metrics.totalReceived = totalReceivedDec.toNumber();
    metrics.totalOutstanding = totalOutstandingDec.toNumber();
    metrics.totalOverdue = totalOverdueDec.toNumber();
    metrics.overdueAgingBreakdown = aging;

    return metrics;
  }

  async update(
    userId: string,
    invoiceId: string,
    dto: UpdateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    const existing = await this.findOne(userId, invoiceId);

    // Architectural Rule: Issued invoices must be immutable!
    if (existing.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException(
        'Issued or cancelled invoices are immutable and cannot be modified. Cancel and reissue if changes are required.',
      );
    }

    if (dto.title) existing.title = dto.title;
    if (dto.issueDate) existing.issueDate = dto.issueDate;
    if (dto.dueDate) existing.dueDate = dto.dueDate;
    if (dto.contactId !== undefined) existing.contactId = dto.contactId || null;
    if (dto.currency) existing.currency = dto.currency;
    if (dto.paymentDetails !== undefined)
      existing.paymentDetails = dto.paymentDetails || null;
    if (dto.terms !== undefined) existing.terms = dto.terms || null;
    if (dto.notes !== undefined) existing.notes = dto.notes || null;
    if (dto.freelancerInfo) existing.freelancerInfo = dto.freelancerInfo as any;
    if (dto.clientInfo) existing.clientInfo = dto.clientInfo as any;
    if (dto.taxMode) existing.taxMode = dto.taxMode;

    const itemsToCalculate = dto.items || existing.items;

    const calculation = this.calculator.calculate({
      items: itemsToCalculate,
      taxMode: existing.taxMode,
      discountAmount: dto.discountAmount ?? existing.discountAmount,
      freelancerState: existing.freelancerInfo?.state,
      clientState: existing.clientInfo?.state,
    });

    existing.subtotal = calculation.subtotal;
    existing.discountAmount = calculation.discountAmount;
    existing.taxAmount = calculation.taxAmount;
    existing.totalAmount = calculation.totalAmount;
    existing.taxDetails = calculation.taxDetails;

    const saved = await this.invoiceRepository.save(existing);

    if (dto.items) {
      await this.itemRepository.delete({ invoiceId });
      const newItems = calculation.items.map((item, index) =>
        this.itemRepository.create({
          invoiceId,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          totalAmount: item.totalAmount,
          sortOrder: item.sortOrder ?? index,
        }),
      );
      await this.itemRepository.save(newItems);
      saved.items = newItems;
    }

    return this.decorateInvoice(saved);
  }

  async issue(userId: string, invoiceId: string): Promise<InvoiceResponseDto> {
    const invoice = await this.findOne(userId, invoiceId);

    if (invoice.status === InvoiceStatus.ISSUED) {
      return invoice;
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cancelled invoices cannot be issued.');
    }

    invoice.status = InvoiceStatus.ISSUED;
    invoice.issuedAt = new Date();

    const saved = await this.invoiceRepository.save(invoice);

    await this.logEvent(
      invoice.invoiceId,
      InvoiceEventType.ISSUED,
      `Invoice ${invoice.invoiceNumber} finalized and issued for total of ${invoice.currency} ${invoice.totalAmount}`,
      { issuedAt: invoice.issuedAt },
    );

    return this.decorateInvoice(saved);
  }

  async send(
    userId: string,
    invoiceId: string,
    dto: SendInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.findOne(userId, invoiceId);

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cannot send a cancelled invoice.');
    }

    // Auto-issue if in draft state
    if (invoice.status === InvoiceStatus.DRAFT) {
      invoice.status = InvoiceStatus.ISSUED;
      invoice.issuedAt = new Date();
      await this.invoiceRepository.save(invoice);
    }

    const recipient =
      dto.recipientEmail || invoice.clientInfo?.email || 'client';

    await this.logEvent(
      invoice.invoiceId,
      InvoiceEventType.SENT,
      `Invoice dispatched to ${recipient}`,
      {
        recipientEmail: recipient,
        recipientName: dto.recipientName,
        message: dto.message,
      },
    );

    return this.decorateInvoice(invoice);
  }

  async recordPayment(
    userId: string,
    invoiceId: string,
    dto: RecordPaymentDto,
  ): Promise<{ payment: InvoicePayment; invoice: InvoiceResponseDto }> {
    const invoice = await this.findOne(userId, invoiceId);

    if (invoice.status !== InvoiceStatus.ISSUED) {
      throw new BadRequestException(
        `Payments can only be recorded on issued invoices. Current status: ${invoice.status}`,
      );
    }

    if (invoice.outstandingAmount <= 0) {
      throw new BadRequestException('This invoice has already been fully paid.');
    }

    const paymentAmount = new Decimal(dto.amount);
    const outstanding = new Decimal(invoice.outstandingAmount);

    if (paymentAmount.gt(outstanding.add(0.01))) {
      throw new BadRequestException(
        `Payment amount (${dto.amount}) cannot exceed outstanding balance (${invoice.outstandingAmount}).`,
      );
    }

    const payment = this.paymentRepository.create({
      invoiceId,
      userId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      paymentDate: dto.paymentDate,
      referenceNumber: dto.referenceNumber || null,
      notes: dto.notes || null,
      status: PaymentRecordStatus.COMPLETED,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    await this.logEvent(
      invoiceId,
      InvoiceEventType.PAYMENT_RECORDED,
      `Payment of ${invoice.currency} ${dto.amount} recorded via ${dto.paymentMethod}${
        dto.referenceNumber ? ` (Ref: ${dto.referenceNumber})` : ''
      }`,
      {
        paymentId: savedPayment.paymentId,
        amount: dto.amount,
        method: dto.paymentMethod,
        referenceNumber: dto.referenceNumber,
      },
    );

    const refreshedInvoice = await this.findOne(userId, invoiceId);

    return {
      payment: savedPayment,
      invoice: refreshedInvoice,
    };
  }

  async getPayments(userId: string, invoiceId: string): Promise<InvoicePayment[]> {
    await this.findOne(userId, invoiceId);

    return this.paymentRepository.find({
      where: { invoiceId, userId },
      order: { paymentDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async recordRefund(
    userId: string,
    invoiceId: string,
    dto: RecordRefundDto,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.findOne(userId, invoiceId);

    const payment = await this.paymentRepository.findOne({
      where: { paymentId: dto.paymentId, invoiceId, userId },
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment transaction ${dto.paymentId} not found on invoice ${invoiceId}`,
      );
    }

    if (payment.status === PaymentRecordStatus.REFUNDED) {
      throw new BadRequestException('This payment transaction has already been refunded.');
    }

    payment.status = PaymentRecordStatus.REFUNDED;
    payment.refundReason = dto.reason;
    payment.refundedAt = new Date();

    await this.paymentRepository.save(payment);

    await this.logEvent(
      invoiceId,
      InvoiceEventType.REFUND_RECORDED,
      `Payment of ${invoice.currency} ${payment.amount} marked refunded: ${dto.reason}`,
      { paymentId: payment.paymentId, amount: payment.amount, reason: dto.reason },
    );

    return this.findOne(userId, invoiceId);
  }

  async remind(
    userId: string,
    invoiceId: string,
    dto: SendReminderDto,
  ): Promise<{
    success: boolean;
    reminderCount: number;
    lastRemindedAt: Date;
    suggestedMessage: string;
  }> {
    const invoice = await this.findOne(userId, invoiceId);

    if (invoice.status !== InvoiceStatus.ISSUED) {
      throw new BadRequestException(
        'Payment reminders can only be dispatched for issued invoices.',
      );
    }

    if (invoice.outstandingAmount <= 0) {
      throw new BadRequestException('Invoice is fully paid. No reminder needed.');
    }

    invoice.reminderCount += 1;
    invoice.lastRemindedAt = new Date();
    await this.invoiceRepository.save(invoice);

    const recipient =
      dto.recipientEmail || invoice.clientInfo?.email || 'Client';
    const suggestedMessage =
      dto.message ||
      `Hi ${invoice.clientInfo?.name || 'there'}, this is a friendly reminder that invoice ${invoice.invoiceNumber} has an outstanding balance of ${invoice.currency} ${invoice.outstandingAmount.toLocaleString('en-IN')}, due on ${invoice.dueDate}. Please let us know if you have any questions.`;

    await this.logEvent(
      invoiceId,
      InvoiceEventType.REMINDER_SENT,
      `Payment reminder #${invoice.reminderCount} sent to ${recipient}`,
      {
        reminderNumber: invoice.reminderCount,
        recipientEmail: recipient,
        message: suggestedMessage,
      },
    );

    return {
      success: true,
      reminderCount: invoice.reminderCount,
      lastRemindedAt: invoice.lastRemindedAt,
      suggestedMessage,
    };
  }

  async cancel(
    userId: string,
    invoiceId: string,
    dto: CancelInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.findOne(userId, invoiceId);

    if (invoice.status === InvoiceStatus.CANCELLED) {
      return invoice;
    }

    // Architectural Rule: Verify no un-refunded payments exist
    const hasCompletedPayments = (invoice.payments || []).some(
      (p) => p.status === PaymentRecordStatus.COMPLETED,
    );

    if (hasCompletedPayments) {
      throw new BadRequestException(
        'Cannot cancel an invoice with active completed payments. Please refund or reverse the payments before cancellation.',
      );
    }

    invoice.status = InvoiceStatus.CANCELLED;
    invoice.cancelledAt = new Date();
    invoice.cancelReason = dto.reason;

    const saved = await this.invoiceRepository.save(invoice);

    await this.logEvent(
      invoiceId,
      InvoiceEventType.CANCELLED,
      `Invoice voided / cancelled: ${dto.reason}`,
      { reason: dto.reason, cancelledAt: invoice.cancelledAt },
    );

    return this.decorateInvoice(saved);
  }

  // --- Public Portal Methods (Unauthenticated Client) ---

  async findByPublicToken(token: string): Promise<InvoiceResponseDto> {
    const invoice = await this.invoiceRepository.findOne({
      where: { publicToken: token },
      relations: {
        items: true,
        payments: true,
        events: true,
      },
      order: {
        items: { sortOrder: 'ASC' },
        payments: { paymentDate: 'DESC' },
        events: { createdAt: 'DESC' },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found or link is invalid.');
    }

    // Auto mark as viewed if in ISSUED state and not yet recorded viewed
    if (invoice.status === InvoiceStatus.ISSUED && !invoice.viewedAt) {
      invoice.viewedAt = new Date();
      await this.invoiceRepository.save(invoice);

      await this.logEvent(
        invoice.invoiceId,
        InvoiceEventType.VIEWED,
        'Invoice opened and viewed by client via secure link',
        { viewedAt: invoice.viewedAt },
      );
    }

    return this.decorateInvoice(invoice);
  }

  // --- Communication, Sharing & Receipts ---

  async getShareInfo(userId: string, invoiceId: string) {
    const invoice = await this.findOne(userId, invoiceId);
    return this.buildInvoiceSharePayload(invoice);
  }

  async regeneratePublicToken(userId: string, invoiceId: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { invoiceId, userId },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    invoice.publicToken = randomUUID();
    const saved = await this.invoiceRepository.save(invoice);

    await this.logEvent(
      invoiceId,
      InvoiceEventType.SHARED,
      'Public access link regenerated and previous token revoked',
      { publicToken: saved.publicToken },
    );

    return this.buildInvoiceSharePayload(saved);
  }

  private buildInvoiceSharePayload(invoice: Invoice) {
    const appUrl = process.env.APP_URL || 'https://app.slimdesk.com';
    const publicUrl = `${appUrl}/invoices/public/${invoice.publicToken}`;
    const clientName =
      invoice.clientInfo?.name || invoice.clientInfo?.company || 'Client';
    const freelancerName =
      invoice.freelancerInfo?.name ||
      invoice.freelancerInfo?.company ||
      'Freelancer';
    const clientPhone =
      invoice.clientInfo?.phone?.replace(/[^0-9]/g, '') || '';

    const suggestedMessage = `Hi ${clientName}, here is invoice ${invoice.invoiceNumber} for ${invoice.currency} ${Number(invoice.totalAmount).toLocaleString('en-IN')} from ${freelancerName}. You can view and pay it securely here: ${publicUrl}`;

    const phoneParam = clientPhone ? `phone=${clientPhone}&` : '';
    const whatsappUrl = `https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(suggestedMessage)}`;

    return {
      publicUrl,
      publicToken: invoice.publicToken,
      whatsappUrl,
      suggestedMessage,
    };
  }

  async generateReceipt(
    userId: string,
    invoiceId: string,
    paymentId: string,
    dto?: GenerateReceiptDto,
  ): Promise<PaymentReceipt> {
    const invoice = await this.invoiceRepository.findOne({
      where: { invoiceId, userId },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    const payment = await this.paymentRepository.findOne({
      where: { paymentId, invoiceId, userId },
    });
    if (!payment) {
      throw new NotFoundException(`Payment transaction ${paymentId} not found`);
    }

    if (payment.status !== PaymentRecordStatus.COMPLETED) {
      throw new BadRequestException(
        `Receipts can only be generated for completed payments. Current payment status: ${payment.status}`,
      );
    }

    const existingReceipt = await this.receiptRepository.findOne({
      where: { paymentId, userId },
    });
    if (existingReceipt) {
      return existingReceipt;
    }

    let receiptNumber: string;
    if (this.settingsService) {
      receiptNumber = await this.settingsService.generateNextDocumentNumber(
        userId,
        DocumentType.RECEIPT,
        payment.paymentDate,
      );
    } else {
      const year = payment.paymentDate
        ? new Date(payment.paymentDate).getFullYear()
        : new Date().getFullYear();
      receiptNumber = `RCT-${year}-${String(Math.floor(Math.random() * 900) + 100)}`;
    }

    const receipt = this.receiptRepository.create({
      userId,
      paymentId,
      invoiceId,
      receiptNumber,
      receiptDate: payment.paymentDate || new Date().toISOString().split('T')[0],
      amountReceived: Number(payment.amount),
      currency: invoice.currency || 'INR',
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.referenceNumber || null,
      clientInfo: invoice.clientInfo || null,
      freelancerInfo: invoice.freelancerInfo || null,
      notes: dto?.notes || payment.notes || 'Payment received with thanks.',
      publicToken: randomUUID(),
    });

    const saved = await this.receiptRepository.save(receipt);

    await this.logEvent(
      invoiceId,
      InvoiceEventType.PAYMENT_RECORDED,
      `Payment receipt ${saved.receiptNumber} generated for payment of ${saved.currency} ${saved.amountReceived}`,
      { receiptId: saved.receiptId, receiptNumber: saved.receiptNumber },
    );

    return saved;
  }

  async getReceiptsForInvoice(
    userId: string,
    invoiceId: string,
  ): Promise<PaymentReceipt[]> {
    return this.receiptRepository.find({
      where: { invoiceId, userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllReceipts(userId: string): Promise<PaymentReceipt[]> {
    return this.receiptRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getReceiptById(
    userId: string,
    receiptId: string,
  ): Promise<PaymentReceipt> {
    const receipt = await this.receiptRepository.findOne({
      where: { receiptId, userId },
    });
    if (!receipt) {
      throw new NotFoundException(`Payment receipt ${receiptId} not found`);
    }
    return receipt;
  }

  async findByPublicReceiptToken(token: string): Promise<PaymentReceipt> {
    const receipt = await this.receiptRepository.findOne({
      where: { publicToken: token },
    });
    if (!receipt) {
      throw new NotFoundException('Payment receipt not found or link has expired');
    }

    if (!receipt.viewedAt) {
      receipt.viewedAt = new Date();
      await this.receiptRepository.save(receipt);
    }

    return receipt;
  }

  // --- Private Helpers ---

  private decorateInvoice(invoice: Invoice): InvoiceResponseDto {
    const state: ComputedPaymentState = this.calculator.computePaymentState(
      Number(invoice.totalAmount) || 0,
      invoice.dueDate,
      invoice.status,
      invoice.payments || [],
    );

    return Object.assign(invoice, {
      paidAmount: state.paidAmount,
      outstandingAmount: state.outstandingAmount,
      refundedAmount: state.refundedAmount,
      paymentStatus: state.paymentStatus,
      isOverdue: state.isOverdue,
      paymentPercentage: state.paymentPercentage,
      daysOverdue: state.daysOverdue,
      agingBucket: state.agingBucket,
      agingLabel: state.agingLabel,
    });
  }

  private async logEvent(
    invoiceId: string,
    eventType: InvoiceEventType | string,
    description: string,
    metadata?: Record<string, any>,
  ): Promise<InvoiceEvent> {
    const event = this.eventRepository.create({
      invoiceId,
      eventType,
      description,
      metadata: metadata || null,
    });

    return this.eventRepository.save(event);
  }
}


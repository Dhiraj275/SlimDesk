import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { Quotation } from '../entities/quotation.entity.js';
import { QuotationItem } from '../entities/quotation-item.entity.js';
import { QuotationVersion } from '../entities/quotation-version.entity.js';
import { QuotationInvoiceAllocation } from '../entities/quotation-invoice-allocation.entity.js';
import { Invoice } from '../../invoices/entities/invoice.entity.js';
import { QuotationStatus } from '../enums/quotation-status.enum.js';
import { InvoiceStatus } from '../../invoices/enums/invoice-status.enum.js';
import { TaxMode } from '../enums/tax-mode.enum.js';
import { QuotationCalculatorService } from './quotation-calculator.service.js';
import { QuotationNumberService } from './quotation-number.service.js';
import { CreateQuotationDto } from '../dto/create-quotation.dto.js';
import { UpdateQuotationDto } from '../dto/update-quotation.dto.js';
import { SendQuotationDto } from '../dto/send-quotation.dto.js';
import { ClientAcceptDto } from '../dto/client-accept.dto.js';
import { ClientRejectDto } from '../dto/client-reject.dto.js';
import { QuotationFilterQueryDto } from '../dto/quotation-filter-query.dto.js';

@Injectable()
export class QuotationsService {
  constructor(
    @InjectRepository(Quotation)
    private readonly quotationRepository: Repository<Quotation>,
    @InjectRepository(QuotationItem)
    private readonly itemRepository: Repository<QuotationItem>,
    @InjectRepository(QuotationVersion)
    private readonly versionRepository: Repository<QuotationVersion>,
    @InjectRepository(QuotationInvoiceAllocation)
    private readonly allocationRepository: Repository<QuotationInvoiceAllocation>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly calculator: QuotationCalculatorService,
    private readonly numberService: QuotationNumberService,
  ) {}

  async create(userId: string, dto: CreateQuotationDto): Promise<Quotation> {
    const quotationNumber = await this.numberService.generateNextNumber(
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

    const quotation = this.quotationRepository.create({
      userId,
      quotationNumber,
      title: dto.title,
      contactId: dto.contactId || null,
      leadId: dto.leadId || null,
      currency: dto.currency || 'INR',
      issueDate: dto.issueDate,
      expiryDate: dto.expiryDate,
      version: 1,
      status: QuotationStatus.DRAFT,
      subtotal: calculation.subtotal,
      discountAmount: calculation.discountAmount,
      taxAmount: calculation.taxAmount,
      totalAmount: calculation.totalAmount,
      taxMode: calculation.taxMode,
      taxDetails: calculation.taxDetails,
      freelancerInfo: dto.freelancerInfo,
      clientInfo: dto.clientInfo,
      paymentSchedule: dto.paymentSchedule || null,
      terms: dto.terms || null,
      notes: dto.notes || null,
      publicToken,
    });

    const savedQuotation = await this.quotationRepository.save(quotation);

    const items = calculation.items.map((item, index) =>
      this.itemRepository.create({
        quotationId: savedQuotation.quotationId,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        discount: item.discount,
        taxRate: item.taxRate,
        taxAmount: item.taxAmount,
        totalAmount: item.totalAmount,
        sortOrder: item.sortOrder ?? index,
      }),
    );

    await this.itemRepository.save(items);
    savedQuotation.items = items;

    return savedQuotation;
  }

  async findAll(
    userId: string,
    query: QuotationFilterQueryDto,
  ): Promise<{ data: Quotation[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 20);
    const skip = (page - 1) * limit;

    const qb = this.quotationRepository
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.items', 'items')
      .where('q.userId = :userId', { userId });

    if (query.status) {
      qb.andWhere('q.status = :status', { status: query.status });
    }

    if (query.contactId) {
      qb.andWhere('q.contactId = :contactId', { contactId: query.contactId });
    }

    if (query.leadId) {
      qb.andWhere('q.leadId = :leadId', { leadId: query.leadId });
    }

    if (query.search) {
      const search = `%${query.search.trim()}%`;
      qb.andWhere(
        '(q.title LIKE :search OR q.quotationNumber LIKE :search OR JSON_UNQUOTE(JSON_EXTRACT(q.clientInfo, "$.name")) LIKE :search OR JSON_UNQUOTE(JSON_EXTRACT(q.clientInfo, "$.company")) LIKE :search)',
        { search },
      );
    }

    qb.orderBy('q.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getMetrics(userId: string) {
    const counts = await this.quotationRepository
      .createQueryBuilder('q')
      .select('q.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(q.totalAmount)', 'totalValue')
      .where('q.userId = :userId', { userId })
      .groupBy('q.status')
      .getRawMany();

    const metrics = {
      total: 0,
      draft: 0,
      sent: 0,
      viewed: 0,
      accepted: 0,
      rejected: 0,
      converted: 0,
      expired: 0,
      acceptedValue: 0,
      totalPipelineValue: 0,
    };

    for (const row of counts) {
      const count = parseInt(row.count, 10) || 0;
      const val = parseFloat(row.totalValue) || 0;
      metrics.total += count;
      metrics.totalPipelineValue += val;

      if (row.status === QuotationStatus.DRAFT) metrics.draft += count;
      if (row.status === QuotationStatus.SENT) metrics.sent += count;
      if (row.status === QuotationStatus.VIEWED) metrics.viewed += count;
      if (row.status === QuotationStatus.ACCEPTED) {
        metrics.accepted += count;
        metrics.acceptedValue += val;
      }
      if (row.status === QuotationStatus.REJECTED) metrics.rejected += count;
      if (row.status === QuotationStatus.CONVERTED) {
        metrics.converted += count;
        metrics.acceptedValue += val;
      }
      if (row.status === QuotationStatus.EXPIRED) metrics.expired += count;
    }

    return metrics;
  }

  async findOne(userId: string, quotationId: string): Promise<Quotation> {
    const quotation = await this.quotationRepository.findOne({
      where: { quotationId, userId },
      relations: {
        items: true,
        versions: true,
      },
      order: {
        items: { sortOrder: 'ASC' },
        versions: { versionNumber: 'DESC' },
      },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation ${quotationId} not found`);
    }

    return quotation;
  }

  async update(
    userId: string,
    quotationId: string,
    dto: UpdateQuotationDto,
  ): Promise<Quotation> {
    const existing = await this.findOne(userId, quotationId);

    if (existing.status === QuotationStatus.CONVERTED) {
      throw new BadRequestException('Converted quotation cannot be modified.');
    }

    // If quotation was already sent, viewed, or accepted, snapshot version before updating
    if (
      existing.status === QuotationStatus.SENT ||
      existing.status === QuotationStatus.VIEWED ||
      existing.status === QuotationStatus.ACCEPTED
    ) {
      await this.createVersionSnapshot(
        existing,
        `Revised from version ${existing.version}`,
      );
      existing.version += 1;
      // Revert status to draft upon revisions unless still keeping sent
      existing.status = QuotationStatus.DRAFT;
    }

    if (dto.title) existing.title = dto.title;
    if (dto.issueDate) existing.issueDate = dto.issueDate;
    if (dto.expiryDate) existing.expiryDate = dto.expiryDate;
    if (dto.contactId !== undefined) existing.contactId = dto.contactId || null;
    if (dto.leadId !== undefined) existing.leadId = dto.leadId || null;
    if (dto.currency) existing.currency = dto.currency;
    if (dto.paymentSchedule !== undefined)
      existing.paymentSchedule = dto.paymentSchedule || null;
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

    const saved = await this.quotationRepository.save(existing);

    if (dto.items) {
      await this.itemRepository.delete({ quotationId });
      const newItems = calculation.items.map((item, index) =>
        this.itemRepository.create({
          quotationId,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          discount: item.discount,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          totalAmount: item.totalAmount,
          sortOrder: item.sortOrder ?? index,
        }),
      );
      await this.itemRepository.save(newItems);
      saved.items = newItems;
    }

    return saved;
  }

  async send(
    userId: string,
    quotationId: string,
    _dto: SendQuotationDto,
  ): Promise<Quotation> {
    const quotation = await this.findOne(userId, quotationId);

    // Create snapshot if version 1 isn't saved yet
    const existingSnapshots = await this.versionRepository.count({
      where: { quotationId, versionNumber: quotation.version },
    });
    if (existingSnapshots === 0) {
      await this.createVersionSnapshot(
        quotation,
        `Quotation v${quotation.version} sent to client`,
      );
    }

    quotation.status = QuotationStatus.SENT;
    await this.quotationRepository.save(quotation);

    return quotation;
  }

  async duplicate(userId: string, quotationId: string): Promise<Quotation> {
    const source = await this.findOne(userId, quotationId);

    return this.create(userId, {
      title: `${source.title} (Copy)`,
      contactId: source.contactId || undefined,
      leadId: source.leadId || undefined,
      currency: source.currency,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      taxMode: source.taxMode,
      discountAmount: Number(source.discountAmount),
      freelancerInfo: source.freelancerInfo as any,
      clientInfo: source.clientInfo as any,
      paymentSchedule: source.paymentSchedule || undefined,
      terms: source.terms || undefined,
      notes: source.notes || undefined,
      items: source.items.map((i) => ({
        description: i.description,
        quantity: Number(i.quantity),
        unit: i.unit,
        unitPrice: Number(i.unitPrice),
        discount: Number(i.discount),
        taxRate: Number(i.taxRate),
        sortOrder: i.sortOrder,
      })),
    });
  }

  async convert(userId: string, quotationId: string): Promise<Invoice> {
    const quotation = await this.findOne(userId, quotationId);

    // Idempotent conversion check
    if (quotation.invoiceId) {
      const existingInvoice = await this.invoiceRepository.findOne({
        where: { invoiceId: quotation.invoiceId, userId },
      });
      if (existingInvoice) {
        return existingInvoice;
      }
    }

    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    const lastInvoice = await this.invoiceRepository
      .createQueryBuilder('inv')
      .where('inv.userId = :userId', { userId })
      .andWhere('inv.invoiceNumber LIKE :pattern', { pattern: `${prefix}%` })
      .orderBy('inv.createdAt', 'DESC')
      .getOne();

    let nextSeq = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const match = lastInvoice.invoiceNumber.match(/INV-\d{4}-(\d+)/);
      if (match && match[1]) {
        nextSeq = parseInt(match[1], 10) + 1;
      }
    }
    const invoiceNumber = `${prefix}${String(nextSeq).padStart(3, '0')}`;

    const invoice = this.invoiceRepository.create({
      userId,
      quotationId: quotation.quotationId,
      contactId: quotation.contactId,
      invoiceNumber,
      title: quotation.title || 'Services Rendered',
      status: InvoiceStatus.DRAFT,
      currency: quotation.currency,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      subtotal: quotation.subtotal,
      discountAmount: Number(quotation.discountAmount) || 0,
      taxAmount: quotation.taxAmount,
      totalAmount: quotation.totalAmount,
      taxMode: quotation.taxMode,
      taxDetails: quotation.taxDetails,
      clientInfo: quotation.clientInfo,
      freelancerInfo: quotation.freelancerInfo,
      publicToken: randomUUID(),
      notes: quotation.paymentSchedule || quotation.notes,
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    quotation.status = QuotationStatus.CONVERTED;
    quotation.convertedAt = new Date();
    quotation.invoiceId = savedInvoice.invoiceId;
    await this.quotationRepository.save(quotation);

    return savedInvoice;
  }

  async remove(userId: string, quotationId: string): Promise<{ success: boolean }> {
    const quotation = await this.findOne(userId, quotationId);

    if (quotation.status === QuotationStatus.CONVERTED) {
      throw new BadRequestException('Cannot delete a converted quotation.');
    }

    await this.quotationRepository.delete({ quotationId, userId });
    return { success: true };
  }

  // --- Public Portal Methods (Unauthenticated Client) ---

  async findByPublicToken(token: string): Promise<Quotation> {
    const quotation = await this.quotationRepository.findOne({
      where: { publicToken: token },
      relations: {
        items: true,
      },
      order: {
        items: { sortOrder: 'ASC' },
      },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    // Auto mark as viewed if in SENT state
    if (quotation.status === QuotationStatus.SENT) {
      quotation.status = QuotationStatus.VIEWED;
      quotation.viewedAt = new Date();
      await this.quotationRepository.save(quotation);
    }

    return quotation;
  }

  async acceptByPublicToken(
    token: string,
    dto: ClientAcceptDto,
  ): Promise<Quotation> {
    const quotation = await this.findByPublicToken(token);

    if (quotation.status === QuotationStatus.ACCEPTED) {
      return quotation;
    }

    if (
      quotation.status !== QuotationStatus.SENT &&
      quotation.status !== QuotationStatus.VIEWED
    ) {
      throw new BadRequestException(
        `Quotation cannot be accepted in ${quotation.status} state.`,
      );
    }

    quotation.status = QuotationStatus.ACCEPTED;
    quotation.acceptedAt = new Date();
    quotation.acceptedByName = dto.name;
    quotation.acceptedByEmail = dto.email;

    if (dto.comments) {
      quotation.notes = quotation.notes
        ? `${quotation.notes}\n\nClient Acceptance Note: ${dto.comments}`
        : `Client Acceptance Note: ${dto.comments}`;
    }

    await this.createVersionSnapshot(
      quotation,
      `Accepted by client: ${dto.name} (${dto.email})`,
    );

    return this.quotationRepository.save(quotation);
  }

  async rejectByPublicToken(
    token: string,
    dto: ClientRejectDto,
  ): Promise<Quotation> {
    const quotation = await this.findByPublicToken(token);

    if (
      quotation.status !== QuotationStatus.SENT &&
      quotation.status !== QuotationStatus.VIEWED
    ) {
      throw new BadRequestException(
        `Quotation cannot be declined in ${quotation.status} state.`,
      );
    }

    quotation.status = QuotationStatus.REJECTED;
    quotation.rejectedAt = new Date();
    quotation.rejectionReason = dto.reason;

    await this.createVersionSnapshot(
      quotation,
      `Declined by client: ${dto.reason}`,
    );

    return this.quotationRepository.save(quotation);
  }

  async getBillingSummary(userId: string, quotationId: string) {
    const quotation = await this.findOne(userId, quotationId);
    const allocations = await this.allocationRepository.find({
      where: { quotationId, userId },
      order: { createdAt: 'ASC' },
    });

    const totalQuotationAmount = Number(quotation.totalAmount) || 0;
    const invoicedAmount = allocations.reduce(
      (sum, a) => sum + (Number(a.allocatedAmount) || 0),
      0,
    );
    const remainingBillableAmount = Math.max(0, totalQuotationAmount - invoicedAmount);
    const isFullyInvoiced = remainingBillableAmount <= 0.001;

    return {
      quotationId: quotation.quotationId,
      quotationNumber: quotation.quotationNumber,
      currency: quotation.currency,
      totalQuotationAmount,
      invoicedAmount,
      remainingBillableAmount,
      isFullyInvoiced,
      allocations,
    };
  }

  async getShareInfo(userId: string, quotationId: string) {
    const quotation = await this.findOne(userId, quotationId);
    return this.buildQuotationSharePayload(quotation);
  }

  async regeneratePublicToken(userId: string, quotationId: string) {
    const quotation = await this.findOne(userId, quotationId);
    quotation.publicToken = randomUUID();
    const saved = await this.quotationRepository.save(quotation);
    return this.buildQuotationSharePayload(saved);
  }

  private buildQuotationSharePayload(quotation: Quotation) {
    const appUrl = process.env.APP_URL || 'https://app.slimdesk.com';
    const publicUrl = `${appUrl}/quotations/public/${quotation.publicToken}`;
    const clientName =
      quotation.clientInfo?.name || quotation.clientInfo?.company || 'Client';
    const freelancerName =
      quotation.freelancerInfo?.name ||
      quotation.freelancerInfo?.company ||
      'Freelancer';
    const clientPhone =
      quotation.clientInfo?.phone?.replace(/[^0-9]/g, '') || '';

    const suggestedMessage = `Hi ${clientName}, here is quotation ${quotation.quotationNumber} for ${quotation.title || 'Services'} (${quotation.currency} ${Number(quotation.totalAmount).toLocaleString('en-IN')}) from ${freelancerName}. You can review and approve it here: ${publicUrl}`;

    const phoneParam = clientPhone ? `phone=${clientPhone}&` : '';
    const whatsappUrl = `https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(suggestedMessage)}`;

    return {
      publicUrl,
      publicToken: quotation.publicToken,
      whatsappUrl,
      suggestedMessage,
    };
  }

  private async createVersionSnapshot(
    quotation: Quotation,
    changeSummary: string,
  ): Promise<QuotationVersion> {
    const snapshot = {
      quotationNumber: quotation.quotationNumber,
      version: quotation.version,
      title: quotation.title,
      currency: quotation.currency,
      issueDate: quotation.issueDate,
      expiryDate: quotation.expiryDate,
      subtotal: quotation.subtotal,
      discountAmount: quotation.discountAmount,
      taxAmount: quotation.taxAmount,
      totalAmount: quotation.totalAmount,
      taxMode: quotation.taxMode,
      taxDetails: quotation.taxDetails,
      freelancerInfo: quotation.freelancerInfo,
      clientInfo: quotation.clientInfo,
      paymentSchedule: quotation.paymentSchedule,
      terms: quotation.terms,
      notes: quotation.notes,
      items: quotation.items || [],
      snapshotTime: new Date().toISOString(),
    };

    const versionRecord = this.versionRepository.create({
      quotationId: quotation.quotationId,
      versionNumber: quotation.version,
      snapshot,
      changeSummary,
    });

    return this.versionRepository.save(versionRecord);
  }
}

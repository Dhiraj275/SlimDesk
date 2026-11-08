import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { InvoicesService } from './invoices.service.js';
import { InvoiceCalculatorService } from './invoice-calculator.service.js';
import { InvoiceNumberService } from './invoice-number.service.js';
import { Invoice } from '../entities/invoice.entity.js';
import { InvoiceItem } from '../entities/invoice-item.entity.js';
import { InvoicePayment } from '../entities/invoice-payment.entity.js';
import { InvoiceEvent } from '../entities/invoice-event.entity.js';
import { Quotation } from '../../quotations/entities/quotation.entity.js';
import { InvoiceStatus } from '../enums/invoice-status.enum.js';
import { PaymentStatus } from '../enums/payment-status.enum.js';
import { PaymentMethod } from '../enums/payment-method.enum.js';
import { PaymentRecordStatus } from '../enums/payment-record-status.enum.js';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let mockInvoiceRepo: any;
  let mockItemRepo: any;
  let mockPaymentRepo: any;
  let mockEventRepo: any;
  let mockQuotationRepo: any;
  let mockNumberService: any;

  beforeEach(async () => {
    mockInvoiceRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn().mockImplementation((entity) => ({ ...entity })),
      save: vi.fn().mockImplementation((entity) =>
        Promise.resolve({
          invoiceId: entity.invoiceId || 'inv-uuid-1',
          ...entity,
        }),
      ),
      delete: vi.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: vi.fn(),
    };

    mockItemRepo = {
      create: vi.fn().mockImplementation((entity) => ({ ...entity, itemId: 'item-uuid-1' })),
      save: vi.fn().mockImplementation((items) => Promise.resolve(items)),
      delete: vi.fn().mockResolvedValue({ affected: 1 }),
    };

    mockPaymentRepo = {
      create: vi.fn().mockImplementation((entity) => ({ ...entity, paymentId: 'pay-uuid-1' })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve(entity)),
      findOne: vi.fn(),
      find: vi.fn().mockResolvedValue([]),
    };

    mockEventRepo = {
      create: vi.fn().mockImplementation((entity) => ({ ...entity, eventId: 'evt-uuid-1' })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve(entity)),
    };

    mockQuotationRepo = {
      findOne: vi.fn(),
      save: vi.fn().mockImplementation((entity) => Promise.resolve(entity)),
    };

    mockNumberService = {
      generateNextNumber: vi.fn().mockResolvedValue('INV-2026-001'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        InvoiceCalculatorService,
        {
          provide: InvoiceNumberService,
          useValue: mockNumberService,
        },
        {
          provide: getRepositoryToken(Invoice),
          useValue: mockInvoiceRepo,
        },
        {
          provide: getRepositoryToken(InvoiceItem),
          useValue: mockItemRepo,
        },
        {
          provide: getRepositoryToken(InvoicePayment),
          useValue: mockPaymentRepo,
        },
        {
          provide: getRepositoryToken(InvoiceEvent),
          useValue: mockEventRepo,
        },
        {
          provide: getRepositoryToken(Quotation),
          useValue: mockQuotationRepo,
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an invoice draft and log created event', async () => {
      const result = await service.create('user-1', {
        title: 'Website Development',
        issueDate: '2026-11-08',
        dueDate: '2026-11-15',
        freelancerInfo: { name: 'Freelancer' } as any,
        clientInfo: { name: 'Acme Studio' } as any,
        items: [
          { description: 'Frontend Dev', quantity: 1, unitPrice: 30000 },
        ],
      });

      expect(mockNumberService.generateNextNumber).toHaveBeenCalledWith('user-1', '2026-11-08');
      expect(result.status).toBe(InvoiceStatus.DRAFT);
      expect(result.subtotal).toBe(30000);
      expect(result.totalAmount).toBe(30000);
      expect(result.paymentStatus).toBe(PaymentStatus.UNPAID);
      expect(mockEventRepo.save).toHaveBeenCalled();
    });
  });

  describe('createFromQuotation', () => {
    it('should convert an accepted quotation to draft invoice', async () => {
      const quotation = {
        quotationId: 'quote-1',
        userId: 'user-1',
        quotationNumber: 'QT-2026-001',
        title: 'Design & Code',
        currency: 'INR',
        taxMode: 'none',
        discountAmount: 0,
        freelancerInfo: { name: 'Dhiraj' },
        clientInfo: { name: 'Acme Studio' },
        items: [{ description: 'Figma to Next.js', quantity: 1, unitPrice: 40000 }],
      };
      mockQuotationRepo.findOne.mockResolvedValue(quotation);
      mockInvoiceRepo.findOne.mockResolvedValue(null);

      const invoice = await service.createFromQuotation('user-1', 'quote-1');

      expect(invoice.quotationId).toBe('quote-1');
      expect(invoice.status).toBe(InvoiceStatus.DRAFT);
      expect(invoice.totalAmount).toBe(40000);
      expect(mockQuotationRepo.save).toHaveBeenCalled();
    });
  });

  describe('update immutability', () => {
    it('should reject updates if invoice is already issued', async () => {
      const issuedInvoice = {
        invoiceId: 'inv-1',
        userId: 'user-1',
        status: InvoiceStatus.ISSUED,
        items: [],
        payments: [],
      };
      mockInvoiceRepo.findOne.mockResolvedValue(issuedInvoice);

      await expect(
        service.update('user-1', 'inv-1', { title: 'New Title' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('issue', () => {
    it('should finalize and issue draft invoice', async () => {
      const draft = {
        invoiceId: 'inv-1',
        userId: 'user-1',
        status: InvoiceStatus.DRAFT,
        invoiceNumber: 'INV-2026-001',
        currency: 'INR',
        totalAmount: 50000,
        items: [],
        payments: [],
      };
      mockInvoiceRepo.findOne.mockResolvedValue(draft);

      const result = await service.issue('user-1', 'inv-1');

      expect(result.status).toBe(InvoiceStatus.ISSUED);
      expect(result.issuedAt).toBeDefined();
      expect(mockEventRepo.save).toHaveBeenCalled();
    });
  });

  describe('recordPayment', () => {
    it('should record payment on issued invoice and update payment status', async () => {
      const issued = {
        invoiceId: 'inv-1',
        userId: 'user-1',
        status: InvoiceStatus.ISSUED,
        totalAmount: 50000,
        dueDate: '2026-11-20',
        currency: 'INR',
        items: [],
        payments: [],
      };
      mockInvoiceRepo.findOne.mockResolvedValue(issued);

      const result = await service.recordPayment('user-1', 'inv-1', {
        amount: 25000,
        paymentMethod: PaymentMethod.UPI,
        paymentDate: '2026-11-08',
        referenceNumber: 'UTR123',
      });

      expect(result.payment.amount).toBe(25000);
      expect(result.payment.paymentMethod).toBe(PaymentMethod.UPI);
      expect(mockEventRepo.save).toHaveBeenCalled();
    });

    it('should reject payment exceeding outstanding balance', async () => {
      const issued = {
        invoiceId: 'inv-1',
        userId: 'user-1',
        status: InvoiceStatus.ISSUED,
        totalAmount: 50000,
        dueDate: '2026-11-20',
        currency: 'INR',
        items: [],
        payments: [
          {
            amount: 40000,
            status: PaymentRecordStatus.COMPLETED,
          },
        ],
      };
      mockInvoiceRepo.findOne.mockResolvedValue(issued);

      await expect(
        service.recordPayment('user-1', 'inv-1', {
          amount: 20000, // outstanding is only 10000
          paymentMethod: PaymentMethod.CASH,
          paymentDate: '2026-11-08',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should reject cancellation if active completed payments exist', async () => {
      const issuedWithPayment = {
        invoiceId: 'inv-1',
        userId: 'user-1',
        status: InvoiceStatus.ISSUED,
        totalAmount: 50000,
        payments: [
          {
            paymentId: 'p1',
            amount: 20000,
            status: PaymentRecordStatus.COMPLETED,
          },
        ],
      };
      mockInvoiceRepo.findOne.mockResolvedValue(issuedWithPayment);

      await expect(
        service.cancel('user-1', 'inv-1', { reason: 'Client requested cancel' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuotationsService } from './quotations.service.js';
import { QuotationCalculatorService } from './quotation-calculator.service.js';
import { QuotationNumberService } from './quotation-number.service.js';
import { Quotation } from '../entities/quotation.entity.js';
import { QuotationItem } from '../entities/quotation-item.entity.js';
import { QuotationVersion } from '../entities/quotation-version.entity.js';
import { QuotationInvoiceAllocation } from '../entities/quotation-invoice-allocation.entity.js';
import { Invoice } from '../../invoices/entities/invoice.entity.js';
import { QuotationStatus } from '../enums/quotation-status.enum.js';
import { TaxMode } from '../enums/tax-mode.enum.js';

describe('QuotationsService', () => {
  let service: QuotationsService;
  let mockQuotationRepo: any;
  let mockItemRepo: any;
  let mockVersionRepo: any;
  let mockAllocationRepo: any;
  let mockInvoiceRepo: any;
  let mockNumberService: any;

  beforeEach(async () => {
    mockQuotationRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn().mockImplementation((entity) => ({ ...entity })),
      save: vi.fn().mockImplementation((entity) =>
        Promise.resolve({
          quotationId: entity.quotationId || 'quote-uuid-1',
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

    mockVersionRepo = {
      create: vi.fn().mockImplementation((entity) => ({ ...entity, versionId: 'ver-uuid-1' })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve(entity)),
      count: vi.fn().mockResolvedValue(0),
    };

    mockAllocationRepo = {
      find: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation((entity) => ({ ...entity, allocationId: 'alloc-1' })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve(entity)),
    };

    mockInvoiceRepo = {
      create: vi.fn().mockImplementation((entity) => ({ ...entity, invoiceId: 'inv-uuid-1' })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve(entity)),
      findOne: vi.fn(),
      createQueryBuilder: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(null),
      }),
    };

    mockNumberService = {
      generateNextNumber: vi.fn().mockResolvedValue('QT-2026-001'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotationsService,
        QuotationCalculatorService,
        {
          provide: QuotationNumberService,
          useValue: mockNumberService,
        },
        {
          provide: getRepositoryToken(Quotation),
          useValue: mockQuotationRepo,
        },
        {
          provide: getRepositoryToken(QuotationItem),
          useValue: mockItemRepo,
        },
        {
          provide: getRepositoryToken(QuotationVersion),
          useValue: mockVersionRepo,
        },
        {
          provide: getRepositoryToken(QuotationInvoiceAllocation),
          useValue: mockAllocationRepo,
        },
        {
          provide: getRepositoryToken(Invoice),
          useValue: mockInvoiceRepo,
        },
      ],
    }).compile();

    service = module.get<QuotationsService>(QuotationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create quotation draft with default TaxMode.NONE and correct items', async () => {
      const result = await service.create('user-1', {
        title: 'Website Development',
        issueDate: '2026-11-06',
        expiryDate: '2026-11-20',
        freelancerInfo: { name: 'Dhiraj' },
        clientInfo: { name: 'Acme Studio' },
        items: [
          { description: 'Design', quantity: 1, unitPrice: 15000 },
          { description: 'Development', quantity: 1, unitPrice: 25000 },
        ],
      });

      expect(mockNumberService.generateNextNumber).toHaveBeenCalledWith('user-1', '2026-11-06');
      expect(result.status).toBe(QuotationStatus.DRAFT);
      expect(result.version).toBe(1);
      expect(result.taxMode).toBe(TaxMode.NONE);
      expect(result.subtotal).toBe(40000);
      expect(result.taxAmount).toBe(0);
      expect(result.totalAmount).toBe(40000);
      expect(result.publicToken).toBeDefined();
    });
  });

  describe('send', () => {
    it('should snapshot version 1 and update status to SENT', async () => {
      const existing = {
        quotationId: 'quote-1',
        userId: 'user-1',
        version: 1,
        status: QuotationStatus.DRAFT,
        items: [],
      };
      mockQuotationRepo.findOne.mockResolvedValue(existing);

      const result = await service.send('user-1', 'quote-1', {});

      expect(mockVersionRepo.save).toHaveBeenCalled();
      expect(result.status).toBe(QuotationStatus.SENT);
    });
  });

  describe('public portal accept', () => {
    it('should accept quotation from client and update audit details', async () => {
      const existing = {
        quotationId: 'quote-1',
        publicToken: 'token-abc',
        status: QuotationStatus.VIEWED,
        items: [],
        version: 1,
      };
      mockQuotationRepo.findOne.mockResolvedValue(existing);

      const result = await service.acceptByPublicToken('token-abc', {
        name: 'Client Contact',
        email: 'client@example.com',
        comments: 'Looks good!',
      });

      expect(result.status).toBe(QuotationStatus.ACCEPTED);
      expect(result.acceptedByName).toBe('Client Contact');
      expect(result.acceptedByEmail).toBe('client@example.com');
      expect(mockVersionRepo.save).toHaveBeenCalled();
    });
  });

  describe('convert to invoice', () => {
    it('should create an invoice and mark quotation as converted', async () => {
      const existing = {
        quotationId: 'quote-1',
        userId: 'user-1',
        status: QuotationStatus.ACCEPTED,
        quotationNumber: 'QT-2026-001',
        currency: 'INR',
        subtotal: 50000,
        taxAmount: 0,
        totalAmount: 50000,
        clientInfo: { name: 'Acme' },
        freelancerInfo: { name: 'Dhiraj' },
        invoiceId: null,
        items: [],
      };
      mockQuotationRepo.findOne.mockResolvedValue(existing);

      const invoice = await service.convert('user-1', 'quote-1');

      expect(invoice.invoiceNumber).toBeDefined();
      expect(invoice.totalAmount).toBe(50000);
      expect(existing.status).toBe(QuotationStatus.CONVERTED);
      expect(mockInvoiceRepo.save).toHaveBeenCalled();
    });

    it('should return existing invoice if already converted (idempotent)', async () => {
      const existingInvoice = {
        invoiceId: 'inv-existing-1',
        invoiceNumber: 'INV-2026-001',
      };
      const existing = {
        quotationId: 'quote-1',
        userId: 'user-1',
        invoiceId: 'inv-existing-1',
        items: [],
      };
      mockQuotationRepo.findOne.mockResolvedValue(existing);
      mockInvoiceRepo.findOne.mockResolvedValue(existingInvoice);

      const invoice = await service.convert('user-1', 'quote-1');
      expect(invoice).toBe(existingInvoice);
      expect(mockInvoiceRepo.create).not.toHaveBeenCalled();
    });
  });
});

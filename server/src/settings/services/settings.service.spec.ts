import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SettingsService } from './settings.service.js';
import { BusinessProfile } from '../entities/business-profile.entity.js';
import { PaymentProfile } from '../entities/payment-profile.entity.js';
import { ServiceItem } from '../entities/service-item.entity.js';
import { DocumentSnippet } from '../entities/document-snippet.entity.js';
import { DocumentNumberSequence } from '../entities/document-number-sequence.entity.js';
import { DocumentType } from '../enums/document-type.enum.js';
import { YearFormat } from '../enums/year-format.enum.js';
import { PaymentProfileType } from '../enums/payment-profile-type.enum.js';
import { DocumentSnippetType } from '../enums/document-snippet-type.enum.js';

describe('SettingsService', () => {
  let service: SettingsService;
  let mockProfileRepo: any;
  let mockPaymentRepo: any;
  let mockServiceRepo: any;
  let mockSnippetRepo: any;
  let mockSequenceRepo: any;

  beforeEach(async () => {
    mockProfileRepo = {
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((e) => ({ ...e, profileId: 'prof-1' })),
      save: vi.fn().mockImplementation((e) => Promise.resolve(e)),
    };

    mockPaymentRepo = {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((e) => ({ ...e, paymentProfileId: 'pay-prof-1' })),
      save: vi.fn().mockImplementation((e) => Promise.resolve(e)),
      update: vi.fn().mockResolvedValue({ affected: 1 }),
      delete: vi.fn().mockResolvedValue({ affected: 1 }),
    };

    mockServiceRepo = {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((e) => ({ ...e, serviceId: 'srv-1' })),
      save: vi.fn().mockImplementation((e) => Promise.resolve(e)),
      delete: vi.fn().mockResolvedValue({ affected: 1 }),
    };

    mockSnippetRepo = {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((e) => ({ ...e, snippetId: 'snip-1' })),
      save: vi.fn().mockImplementation((e) => Promise.resolve(e)),
      update: vi.fn().mockResolvedValue({ affected: 1 }),
      delete: vi.fn().mockResolvedValue({ affected: 1 }),
    };

    mockSequenceRepo = {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((e) => ({ ...e, sequenceId: 'seq-1' })),
      save: vi.fn().mockImplementation((e) => Promise.resolve(e)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: getRepositoryToken(BusinessProfile),
          useValue: mockProfileRepo,
        },
        {
          provide: getRepositoryToken(PaymentProfile),
          useValue: mockPaymentRepo,
        },
        {
          provide: getRepositoryToken(ServiceItem),
          useValue: mockServiceRepo,
        },
        {
          provide: getRepositoryToken(DocumentSnippet),
          useValue: mockSnippetRepo,
        },
        {
          provide: getRepositoryToken(DocumentNumberSequence),
          useValue: mockSequenceRepo,
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Business Profile', () => {
    it('should create default business profile if not exists', async () => {
      mockProfileRepo.findOne.mockResolvedValue(null);

      const profile = await service.getProfile('user-1');

      expect(profile.businessName).toBe('My Freelance Studio');
      expect(mockProfileRepo.save).toHaveBeenCalled();
    });

    it('should update business profile', async () => {
      mockProfileRepo.findOne.mockResolvedValue({
        profileId: 'p1',
        userId: 'user-1',
        businessName: 'Old Studio',
      });

      const updated = await service.updateProfile('user-1', {
        businessName: 'Slimdesk Studio',
        gstin: '24ABCDE1234F1Z5',
      });

      expect(updated.businessName).toBe('Slimdesk Studio');
      expect(updated.gstin).toBe('24ABCDE1234F1Z5');
      expect(mockProfileRepo.save).toHaveBeenCalled();
    });
  });

  describe('Payment Profiles', () => {
    it('should unset previous defaults when creating default payment profile', async () => {
      const dto = {
        name: 'HDFC Current',
        type: PaymentProfileType.BANK_TRANSFER,
        isDefault: true,
        details: { bankName: 'HDFC Bank', accountNumber: '123456789' },
      };

      const result = await service.createPaymentProfile('user-1', dto);

      expect(mockPaymentRepo.update).toHaveBeenCalledWith(
        { userId: 'user-1', isDefault: true },
        { isDefault: false },
      );
      expect(result.isDefault).toBe(true);
      expect(mockPaymentRepo.save).toHaveBeenCalled();
    });
  });

  describe('Document Number Sequence Generator', () => {
    it('should generate formatted sequential document numbers and increment sequence', async () => {
      const sequence = {
        sequenceId: 'seq-1',
        userId: 'user-1',
        documentType: DocumentType.INVOICE,
        prefix: 'INV-',
        yearFormat: YearFormat.YYYY,
        nextNumber: 42,
        paddingDigits: 4,
      };

      mockSequenceRepo.findOne.mockResolvedValue(sequence);

      const docNumber = await service.generateNextDocumentNumber(
        'user-1',
        DocumentType.INVOICE,
        '2026-11-10',
      );

      expect(docNumber).toBe('INV-2026-0042');
      expect(sequence.nextNumber).toBe(43);
      expect(mockSequenceRepo.save).toHaveBeenCalledWith(sequence);
    });

    it('should generate quotation numbers with 2-digit year format', async () => {
      const sequence = {
        sequenceId: 'seq-2',
        userId: 'user-1',
        documentType: DocumentType.QUOTATION,
        prefix: 'QT-',
        yearFormat: YearFormat.YY,
        nextNumber: 1,
        paddingDigits: 3,
      };

      mockSequenceRepo.findOne.mockResolvedValue(sequence);

      const docNumber = await service.generateNextDocumentNumber(
        'user-1',
        DocumentType.QUOTATION,
        '2026-05-15',
      );

      expect(docNumber).toBe('QT-26-001');
      expect(sequence.nextNumber).toBe(2);
    });
  });

  describe('Document Defaults Combiner', () => {
    it('should assemble profile, payment profile, and snippet defaults', async () => {
      mockProfileRepo.findOne.mockResolvedValue({
        userId: 'user-1',
        businessName: 'My Design Studio',
        defaultCurrency: 'INR',
        dueDaysPreset: 14,
        taxMode: 'none',
        defaultTaxRate: 0,
      });

      mockPaymentRepo.find.mockResolvedValue([
        {
          paymentProfileId: 'pp1',
          name: 'Primary UPI',
          type: 'upi',
          isDefault: true,
          details: { upiId: 'dhiraj@okhdfcbank' },
        },
      ]);

      mockSnippetRepo.findOne.mockImplementation(({ where }: any) => {
        if (where.type === DocumentSnippetType.TERMS) {
          return Promise.resolve({ content: 'Standard 14 days payment terms.' });
        }
        return Promise.resolve(null);
      });

      const defaults = await service.getDocumentDefaults('user-1');

      expect(defaults.profile.businessName).toBe('My Design Studio');
      expect(defaults.defaultPaymentProfile.name).toBe('Primary UPI');
      expect(defaults.paymentInstructions).toContain('UPI: dhiraj@okhdfcbank');
      expect(defaults.defaultTerms).toBe('Standard 14 days payment terms.');
      expect(defaults.defaultCurrency).toBe('INR');
      expect(defaults.dueDaysPreset).toBe(14);
    });
  });
});


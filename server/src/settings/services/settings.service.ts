import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessProfile } from '../entities/business-profile.entity.js';
import { PaymentProfile } from '../entities/payment-profile.entity.js';
import { ServiceItem } from '../entities/service-item.entity.js';
import { DocumentSnippet } from '../entities/document-snippet.entity.js';
import { DocumentNumberSequence } from '../entities/document-number-sequence.entity.js';
import { DocumentType } from '../enums/document-type.enum.js';
import { YearFormat } from '../enums/year-format.enum.js';
import { DocumentSnippetType } from '../enums/document-snippet-type.enum.js';
import { UpdateBusinessProfileDto } from '../dto/update-business-profile.dto.js';
import {
  CreatePaymentProfileDto,
  UpdatePaymentProfileDto,
} from '../dto/payment-profile.dto.js';
import {
  CreateServiceItemDto,
  UpdateServiceItemDto,
} from '../dto/service-item.dto.js';
import {
  CreateDocumentSnippetDto,
  UpdateDocumentSnippetDto,
} from '../dto/document-snippet.dto.js';
import { UpdateSequenceDto } from '../dto/sequence.dto.js';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(BusinessProfile)
    private readonly profileRepository: Repository<BusinessProfile>,
    @InjectRepository(PaymentProfile)
    private readonly paymentProfileRepository: Repository<PaymentProfile>,
    @InjectRepository(ServiceItem)
    private readonly serviceItemRepository: Repository<ServiceItem>,
    @InjectRepository(DocumentSnippet)
    private readonly snippetRepository: Repository<DocumentSnippet>,
    @InjectRepository(DocumentNumberSequence)
    private readonly sequenceRepository: Repository<DocumentNumberSequence>,
  ) {}

  // --- Business Profile ---

  async getProfile(userId: string): Promise<BusinessProfile> {
    let profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepository.create({
        userId,
        businessName: '',
      });
      profile = await this.profileRepository.save(profile);
    }
    return profile;
  }

  async updateProfile(
    userId: string,
    dto: UpdateBusinessProfileDto,
  ): Promise<BusinessProfile> {
    const profile = await this.getProfile(userId);
    Object.assign(profile, dto);
    return this.profileRepository.save(profile);
  }

  // --- Payment Profiles ---

  async getPaymentProfiles(userId: string): Promise<PaymentProfile[]> {
    return this.paymentProfileRepository.find({
      where: { userId, isActive: true },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  async createPaymentProfile(
    userId: string,
    dto: CreatePaymentProfileDto,
  ): Promise<PaymentProfile> {
    if (dto.isDefault) {
      await this.paymentProfileRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    const profile = this.paymentProfileRepository.create({
      userId,
      ...dto,
      isDefault: Boolean(dto.isDefault),
    });

    return this.paymentProfileRepository.save(profile);
  }

  async updatePaymentProfile(
    userId: string,
    id: string,
    dto: UpdatePaymentProfileDto,
  ): Promise<PaymentProfile> {
    const profile = await this.paymentProfileRepository.findOne({
      where: { paymentProfileId: id, userId },
    });
    if (!profile) {
      throw new NotFoundException(`Payment profile ${id} not found`);
    }

    if (dto.isDefault) {
      await this.paymentProfileRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    Object.assign(profile, dto);
    return this.paymentProfileRepository.save(profile);
  }

  async deletePaymentProfile(userId: string, id: string): Promise<void> {
    const profile = await this.paymentProfileRepository.findOne({
      where: { paymentProfileId: id, userId },
    });
    if (!profile) {
      throw new NotFoundException(`Payment profile ${id} not found`);
    }
    await this.paymentProfileRepository.delete({ paymentProfileId: id, userId });
  }

  async setDefaultPaymentProfile(
    userId: string,
    id: string,
  ): Promise<PaymentProfile> {
    await this.paymentProfileRepository.update(
      { userId, isDefault: true },
      { isDefault: false },
    );

    const profile = await this.paymentProfileRepository.findOne({
      where: { paymentProfileId: id, userId },
    });
    if (!profile) {
      throw new NotFoundException(`Payment profile ${id} not found`);
    }

    profile.isDefault = true;
    return this.paymentProfileRepository.save(profile);
  }

  // --- Services Catalog ---

  async getServices(userId: string): Promise<ServiceItem[]> {
    return this.serviceItemRepository.find({
      where: { userId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async createService(
    userId: string,
    dto: CreateServiceItemDto,
  ): Promise<ServiceItem> {
    const service = this.serviceItemRepository.create({
      userId,
      ...dto,
    });
    return this.serviceItemRepository.save(service);
  }

  async updateService(
    userId: string,
    id: string,
    dto: UpdateServiceItemDto,
  ): Promise<ServiceItem> {
    const service = await this.serviceItemRepository.findOne({
      where: { serviceId: id, userId },
    });
    if (!service) {
      throw new NotFoundException(`Service ${id} not found`);
    }
    Object.assign(service, dto);
    return this.serviceItemRepository.save(service);
  }

  async deleteService(userId: string, id: string): Promise<void> {
    const service = await this.serviceItemRepository.findOne({
      where: { serviceId: id, userId },
    });
    if (!service) {
      throw new NotFoundException(`Service ${id} not found`);
    }
    await this.serviceItemRepository.delete({ serviceId: id, userId });
  }

  // --- Document Snippets ---

  async getSnippets(
    userId: string,
    type?: DocumentSnippetType,
  ): Promise<DocumentSnippet[]> {
    const where: any = { userId };
    if (type) where.type = type;
    return this.snippetRepository.find({
      where,
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async createSnippet(
    userId: string,
    dto: CreateDocumentSnippetDto,
  ): Promise<DocumentSnippet> {
    if (dto.isDefault) {
      await this.snippetRepository.update(
        { userId, type: dto.type, isDefault: true },
        { isDefault: false },
      );
    }
    const snippet = this.snippetRepository.create({
      userId,
      ...dto,
    });
    return this.snippetRepository.save(snippet);
  }

  async updateSnippet(
    userId: string,
    id: string,
    dto: UpdateDocumentSnippetDto,
  ): Promise<DocumentSnippet> {
    const snippet = await this.snippetRepository.findOne({
      where: { snippetId: id, userId },
    });
    if (!snippet) {
      throw new NotFoundException(`Snippet ${id} not found`);
    }
    if (dto.isDefault && dto.type) {
      await this.snippetRepository.update(
        { userId, type: dto.type, isDefault: true },
        { isDefault: false },
      );
    }
    Object.assign(snippet, dto);
    return this.snippetRepository.save(snippet);
  }

  async deleteSnippet(userId: string, id: string): Promise<void> {
    const snippet = await this.snippetRepository.findOne({
      where: { snippetId: id, userId },
    });
    if (!snippet) {
      throw new NotFoundException(`Snippet ${id} not found`);
    }
    await this.snippetRepository.delete({ snippetId: id, userId });
  }

  // --- Number Sequences ---

  async getSequences(userId: string): Promise<DocumentNumberSequence[]> {
    const types = [
      DocumentType.QUOTATION,
      DocumentType.INVOICE,
      DocumentType.RECEIPT,
    ];
    const defaultPrefixes: Record<DocumentType, string> = {
      [DocumentType.QUOTATION]: 'QT-',
      [DocumentType.INVOICE]: 'INV-',
      [DocumentType.RECEIPT]: 'RCT-',
    };

    const result: DocumentNumberSequence[] = [];
    for (const t of types) {
      let seq = await this.sequenceRepository.findOne({
        where: { userId, documentType: t },
      });
      if (!seq) {
        seq = this.sequenceRepository.create({
          userId,
          documentType: t,
          prefix: defaultPrefixes[t],
          yearFormat: YearFormat.YYYY,
          nextNumber: 1,
          paddingDigits: 3,
        });
        seq = await this.sequenceRepository.save(seq);
      }
      result.push(seq);
    }
    return result;
  }

  async updateSequence(
    userId: string,
    documentType: DocumentType,
    dto: UpdateSequenceDto,
  ): Promise<DocumentNumberSequence> {
    let seq = await this.sequenceRepository.findOne({
      where: { userId, documentType },
    });
    if (!seq) {
      seq = this.sequenceRepository.create({
        userId,
        documentType,
        prefix:
          documentType === DocumentType.QUOTATION
            ? 'QT-'
            : documentType === DocumentType.INVOICE
              ? 'INV-'
              : 'RCT-',
        yearFormat: YearFormat.YYYY,
        nextNumber: 1,
        paddingDigits: 3,
      });
    }
    Object.assign(seq, dto);
    return this.sequenceRepository.save(seq);
  }

  async generateNextDocumentNumber(
    userId: string,
    documentType: DocumentType,
    dateStr?: string,
  ): Promise<string> {
    const sequences = await this.getSequences(userId);
    const seq = sequences.find((s) => s.documentType === documentType)!;

    const date = dateStr ? new Date(dateStr) : new Date();
    const fullYear = date.getFullYear();
    const shortYear = String(fullYear).slice(-2);

    let yearPart = '';
    if (seq.yearFormat === YearFormat.YYYY) {
      yearPart = `${fullYear}-`;
    } else if (seq.yearFormat === YearFormat.YY) {
      yearPart = `${shortYear}-`;
    }

    const currentNumber = seq.nextNumber || 1;
    const padded = String(currentNumber).padStart(seq.paddingDigits || 3, '0');
    const formatted = `${seq.prefix}${yearPart}${padded}`;

    // Increment and persist next number
    seq.nextNumber = currentNumber + 1;
    await this.sequenceRepository.save(seq);

    return formatted;
  }

  // --- Document Defaults Helper ---

  async getDocumentDefaults(userId: string) {
    const profile = await this.getProfile(userId);
    const paymentProfiles = await this.getPaymentProfiles(userId);
    const defaultPaymentProfile =
      paymentProfiles.find((p) => p.isDefault) || paymentProfiles[0] || null;

    const defaultTerms = await this.snippetRepository.findOne({
      where: { userId, type: DocumentSnippetType.TERMS, isDefault: true },
    });
    const defaultNotes = await this.snippetRepository.findOne({
      where: { userId, type: DocumentSnippetType.NOTES, isDefault: true },
    });

    let paymentInstructions = '';
    if (defaultPaymentProfile) {
      if (defaultPaymentProfile.type === 'upi') {
        paymentInstructions = `UPI: ${defaultPaymentProfile.details?.upiId || ''} (${defaultPaymentProfile.details?.accountHolderName || profile.businessName})`;
      } else if (defaultPaymentProfile.type === 'bank_transfer') {
        paymentInstructions = `Bank: ${defaultPaymentProfile.details?.bankName || ''} | A/C: ${defaultPaymentProfile.details?.accountNumber || ''} | IFSC: ${defaultPaymentProfile.details?.ifscCode || ''}`;
      } else if (defaultPaymentProfile.details?.instructions) {
        paymentInstructions = defaultPaymentProfile.details.instructions;
      }
      if (defaultPaymentProfile.instructions) {
        paymentInstructions += `\n${defaultPaymentProfile.instructions}`;
      }
    }

    return {
      profile,
      defaultPaymentProfile,
      paymentInstructions: paymentInstructions.trim() || null,
      defaultTerms: defaultTerms?.content || null,
      defaultNotes: defaultNotes?.content || null,
      defaultCurrency: profile.defaultCurrency || 'INR',
      dueDaysPreset: profile.dueDaysPreset || 14,
      documentTemplate: profile.documentTemplate,
      taxMode: profile.taxMode,
      defaultTaxRate: Number(profile.defaultTaxRate) || 0,
    };
  }
}

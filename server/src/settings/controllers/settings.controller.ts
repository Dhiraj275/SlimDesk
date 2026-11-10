import {
  Controller,
  Get,
  Put,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SettingsService } from '../services/settings.service.js';
import { BusinessProfile } from '../entities/business-profile.entity.js';
import { PaymentProfile } from '../entities/payment-profile.entity.js';
import { ServiceItem } from '../entities/service-item.entity.js';
import { DocumentSnippet } from '../entities/document-snippet.entity.js';
import { DocumentNumberSequence } from '../entities/document-number-sequence.entity.js';
import { DocumentType } from '../enums/document-type.enum.js';
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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { User } from '../../users/entities/user.entity.js';

@ApiTags('Settings & Document Defaults')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // --- Business Profile & Document Defaults ---

  @Get('profile')
  @ApiOperation({
    summary: 'Get business profile & document defaults',
    description:
      'Retrieves the reusable business identity, branding (logo, signature, color), tax info (GSTIN), and default document preferences.',
  })
  @ApiResponse({ status: 200, type: BusinessProfile })
  getProfile(@CurrentUser() user: User): Promise<BusinessProfile> {
    return this.settingsService.getProfile(user.userId);
  }

  @Put('profile')
  @ApiOperation({
    summary: 'Update business profile & document defaults',
    description:
      'Updates business identity, branding, GSTIN, default currency, and document templates. Changes will apply to future documents without mutating past issued document snapshots.',
  })
  @ApiResponse({ status: 200, type: BusinessProfile })
  updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateBusinessProfileDto,
  ): Promise<BusinessProfile> {
    return this.settingsService.updateProfile(user.userId, dto);
  }

  @Get('document-defaults')
  @ApiOperation({
    summary: 'Get combined document defaults',
    description:
      'Convenience endpoint returning pre-composed defaults (business info, default payment instructions, terms, notes, template) for prefilling quotation and invoice builders.',
  })
  getDocumentDefaults(@CurrentUser() user: User) {
    return this.settingsService.getDocumentDefaults(user.userId);
  }

  // --- Payment Profiles ---

  @Get('payment-profiles')
  @ApiOperation({
    summary: 'List payment profiles',
    description:
      'Lists reusable payment destination profiles (bank accounts, UPI IDs, international wire details).',
  })
  @ApiResponse({ status: 200, type: [PaymentProfile] })
  getPaymentProfiles(@CurrentUser() user: User): Promise<PaymentProfile[]> {
    return this.settingsService.getPaymentProfiles(user.userId);
  }

  @Post('payment-profiles')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create payment profile',
    description:
      'Add a new reusable payment profile (e.g. HDFC Current Account, Personal UPI, Wise USD).',
  })
  @ApiResponse({ status: 201, type: PaymentProfile })
  createPaymentProfile(
    @CurrentUser() user: User,
    @Body() dto: CreatePaymentProfileDto,
  ): Promise<PaymentProfile> {
    return this.settingsService.createPaymentProfile(user.userId, dto);
  }

  @Patch('payment-profiles/:id')
  @ApiOperation({ summary: 'Update payment profile' })
  @ApiParam({ name: 'id', description: 'Payment profile UUID' })
  @ApiResponse({ status: 200, type: PaymentProfile })
  updatePaymentProfile(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdatePaymentProfileDto,
  ): Promise<PaymentProfile> {
    return this.settingsService.updatePaymentProfile(user.userId, id, dto);
  }

  @Delete('payment-profiles/:id')
  @ApiOperation({ summary: 'Delete payment profile' })
  @ApiParam({ name: 'id', description: 'Payment profile UUID' })
  deletePaymentProfile(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<void> {
    return this.settingsService.deletePaymentProfile(user.userId, id);
  }

  @Post('payment-profiles/:id/set-default')
  @ApiOperation({ summary: 'Set payment profile as default' })
  @ApiParam({ name: 'id', description: 'Payment profile UUID' })
  @ApiResponse({ status: 200, type: PaymentProfile })
  setDefaultPaymentProfile(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<PaymentProfile> {
    return this.settingsService.setDefaultPaymentProfile(user.userId, id);
  }

  // --- Services Catalog ---

  @Get('services')
  @ApiOperation({
    summary: 'List services catalog items',
    description:
      'Lists saved reusable line items and deliverables with default rates and units.',
  })
  @ApiResponse({ status: 200, type: [ServiceItem] })
  getServices(@CurrentUser() user: User): Promise<ServiceItem[]> {
    return this.settingsService.getServices(user.userId);
  }

  @Post('services')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add item to services catalog',
    description: 'Save a reusable deliverable template with default pricing.',
  })
  @ApiResponse({ status: 201, type: ServiceItem })
  createService(
    @CurrentUser() user: User,
    @Body() dto: CreateServiceItemDto,
  ): Promise<ServiceItem> {
    return this.settingsService.createService(user.userId, dto);
  }

  @Patch('services/:id')
  @ApiOperation({ summary: 'Update catalog service item' })
  @ApiParam({ name: 'id', description: 'Service item UUID' })
  @ApiResponse({ status: 200, type: ServiceItem })
  updateService(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateServiceItemDto,
  ): Promise<ServiceItem> {
    return this.settingsService.updateService(user.userId, id, dto);
  }

  @Delete('services/:id')
  @ApiOperation({ summary: 'Delete catalog service item' })
  @ApiParam({ name: 'id', description: 'Service item UUID' })
  deleteService(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<void> {
    return this.settingsService.deleteService(user.userId, id);
  }

  // --- Document Snippets ---

  @Get('snippets')
  @ApiOperation({
    summary: 'List terms and notes snippets',
    description:
      'Lists reusable standard terms & conditions, payment clauses, and document notes.',
  })
  @ApiQuery({
    name: 'type',
    enum: DocumentSnippetType,
    required: false,
    description: 'Filter by snippet type (terms, notes, payment_terms)',
  })
  @ApiResponse({ status: 200, type: [DocumentSnippet] })
  getSnippets(
    @CurrentUser() user: User,
    @Query('type') type?: DocumentSnippetType,
  ): Promise<DocumentSnippet[]> {
    return this.settingsService.getSnippets(user.userId, type);
  }

  @Post('snippets')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create reusable snippet' })
  @ApiResponse({ status: 201, type: DocumentSnippet })
  createSnippet(
    @CurrentUser() user: User,
    @Body() dto: CreateDocumentSnippetDto,
  ): Promise<DocumentSnippet> {
    return this.settingsService.createSnippet(user.userId, dto);
  }

  @Patch('snippets/:id')
  @ApiOperation({ summary: 'Update reusable snippet' })
  @ApiParam({ name: 'id', description: 'Snippet UUID' })
  @ApiResponse({ status: 200, type: DocumentSnippet })
  updateSnippet(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentSnippetDto,
  ): Promise<DocumentSnippet> {
    return this.settingsService.updateSnippet(user.userId, id, dto);
  }

  @Delete('snippets/:id')
  @ApiOperation({ summary: 'Delete reusable snippet' })
  @ApiParam({ name: 'id', description: 'Snippet UUID' })
  deleteSnippet(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<void> {
    return this.settingsService.deleteSnippet(user.userId, id);
  }

  // --- Document Number Sequences ---

  @Get('sequences')
  @ApiOperation({
    summary: 'List document numbering configurations',
    description:
      'Returns sequential numbering configuration (prefix, year format, padding, nextNumber) for quotations, invoices, and receipts.',
  })
  @ApiResponse({ status: 200, type: [DocumentNumberSequence] })
  getSequences(
    @CurrentUser() user: User,
  ): Promise<DocumentNumberSequence[]> {
    return this.settingsService.getSequences(user.userId);
  }

  @Patch('sequences/:documentType')
  @ApiOperation({
    summary: 'Configure numbering sequence for a document type',
    description:
      'Customizes prefix (e.g. INV-, QT-, RCT-), padding, and starting sequence numbers.',
  })
  @ApiParam({ name: 'documentType', enum: DocumentType })
  @ApiResponse({ status: 200, type: DocumentNumberSequence })
  updateSequence(
    @CurrentUser() user: User,
    @Param('documentType') documentType: DocumentType,
    @Body() dto: UpdateSequenceDto,
  ): Promise<DocumentNumberSequence> {
    return this.settingsService.updateSequence(user.userId, documentType, dto);
  }
}


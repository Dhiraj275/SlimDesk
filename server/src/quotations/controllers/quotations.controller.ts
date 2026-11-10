import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { QuotationsService } from '../services/quotations.service.js';
import { CreateQuotationDto } from '../dto/create-quotation.dto.js';
import { UpdateQuotationDto } from '../dto/update-quotation.dto.js';
import { SendQuotationDto } from '../dto/send-quotation.dto.js';
import { QuotationFilterQueryDto } from '../dto/quotation-filter-query.dto.js';
import { Quotation } from '../entities/quotation.entity.js';
import { Invoice } from '../../invoices/entities/invoice.entity.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { User } from '../../users/entities/user.entity.js';

@ApiTags('Quotations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new quotation draft',
    description:
      'Creates a new commercial quotation draft with auto-calculated subtotals, tax (optional), and totals.',
  })
  @ApiResponse({ status: 201, description: 'Quotation created successfully', type: Quotation })
  create(
    @CurrentUser() user: User,
    @Body() createQuotationDto: CreateQuotationDto,
  ): Promise<Quotation> {
    return this.quotationsService.create(user.userId, createQuotationDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List quotations with filters and pagination',
    description: 'Retrieve quotations owned by the authenticated freelancer.',
  })
  findAll(
    @CurrentUser() user: User,
    @Query() query: QuotationFilterQueryDto,
  ) {
    return this.quotationsService.findAll(user.userId, query);
  }

  @Get('metrics')
  @ApiOperation({
    summary: 'Get quotation performance metrics',
    description:
      'Summary stats on quotations (total, drafts, sent, accepted, converted value).',
  })
  getMetrics(@CurrentUser() user: User) {
    return this.quotationsService.getMetrics(user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get detailed quotation with line items and versions',
  })
  @ApiParam({ name: 'id', description: 'Quotation UUID' })
  @ApiResponse({ status: 200, type: Quotation })
  findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<Quotation> {
    return this.quotationsService.findOne(user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update quotation',
    description:
      'Updates line items, details, and recalculates totals. If previously sent/accepted, automatically creates version snapshot.',
  })
  @ApiParam({ name: 'id', description: 'Quotation UUID' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateQuotationDto: UpdateQuotationDto,
  ): Promise<Quotation> {
    return this.quotationsService.update(user.userId, id, updateQuotationDto);
  }

  @Post(':id/send')
  @ApiOperation({
    summary: 'Dispatch quotation to client',
    description:
      'Snapshots current version, creates public sharing token, and marks quotation as sent.',
  })
  @ApiParam({ name: 'id', description: 'Quotation UUID' })
  send(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() sendDto: SendQuotationDto,
  ): Promise<Quotation> {
    return this.quotationsService.send(user.userId, id, sendDto);
  }

  @Post(':id/duplicate')
  @ApiOperation({
    summary: 'Duplicate an existing quotation',
  })
  @ApiParam({ name: 'id', description: 'Quotation UUID' })
  duplicate(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<Quotation> {
    return this.quotationsService.duplicate(user.userId, id);
  }

  @Post(':id/convert')
  @ApiOperation({
    summary: 'Convert accepted quotation into invoice',
    description:
      'Idempotently creates an invoice from the quotation and marks quotation as converted.',
  })
  @ApiParam({ name: 'id', description: 'Quotation UUID' })
  @ApiResponse({ status: 200, type: Invoice })
  convert(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<Invoice> {
    return this.quotationsService.convert(user.userId, id);
  }

  @Get(':id/billing-summary')
  @ApiOperation({
    summary: 'Get quotation billing and conversion summary',
    description:
      'Returns total quotation amount, invoiced amount across partial milestones, remaining billable balance, and allocation history.',
  })
  @ApiParam({ name: 'id', description: 'Quotation UUID' })
  getBillingSummary(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.quotationsService.getBillingSummary(user.userId, id);
  }

  @Get(':id/share')
  @ApiOperation({
    summary: 'Get share link and WhatsApp click-to-chat payload',
    description:
      'Generates secure public link, prefilled WhatsApp message with client greeting and quotation summary.',
  })
  @ApiParam({ name: 'id', description: 'Quotation UUID' })
  getShareInfo(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.quotationsService.getShareInfo(user.userId, id);
  }

  @Post(':id/regenerate-token')
  @ApiOperation({
    summary: 'Regenerate quotation public token',
    description:
      'Revokes the previous public link and creates a new secure unguessable access token.',
  })
  @ApiParam({ name: 'id', description: 'Quotation UUID' })
  regenerateToken(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.quotationsService.regeneratePublicToken(user.userId, id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete quotation draft',
  })
  @ApiParam({ name: 'id', description: 'Quotation UUID' })
  remove(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.quotationsService.remove(user.userId, id);
  }
}

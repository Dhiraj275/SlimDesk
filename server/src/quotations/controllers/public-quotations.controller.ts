import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { QuotationsService } from '../services/quotations.service.js';
import { ClientAcceptDto } from '../dto/client-accept.dto.js';
import { ClientRejectDto } from '../dto/client-reject.dto.js';
import { Quotation } from '../entities/quotation.entity.js';

@ApiTags('Public Quotations')
@Controller('quotations/public')
export class PublicQuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Get(':token')
  @ApiOperation({
    summary: 'View public quotation via secure token',
    description:
      'Unauthenticated client portal endpoint. Viewing a quotation in "sent" status automatically updates it to "viewed".',
  })
  @ApiParam({ name: 'token', description: 'Unique unguessable public token' })
  @ApiResponse({ status: 200, type: Quotation })
  findByPublicToken(@Param('token') token: string): Promise<Quotation> {
    return this.quotationsService.findByPublicToken(token);
  }

  @Post(':token/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Accept commercial quotation as client',
    description:
      'Marks the quotation as accepted, records accepting party credentials and timestamp.',
  })
  @ApiParam({ name: 'token', description: 'Unique unguessable public token' })
  @ApiResponse({ status: 200, type: Quotation })
  acceptByPublicToken(
    @Param('token') token: string,
    @Body() dto: ClientAcceptDto,
  ): Promise<Quotation> {
    return this.quotationsService.acceptByPublicToken(token, dto);
  }

  @Post(':token/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Decline commercial quotation as client',
    description:
      'Marks quotation as rejected and records decline reason and timestamp.',
  })
  @ApiParam({ name: 'token', description: 'Unique unguessable public token' })
  @ApiResponse({ status: 200, type: Quotation })
  rejectByPublicToken(
    @Param('token') token: string,
    @Body() dto: ClientRejectDto,
  ): Promise<Quotation> {
    return this.quotationsService.rejectByPublicToken(token, dto);
  }
}

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
import { LeadsService } from './leads.service.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';
import { UpdateLeadDto } from './dto/update-lead.dto.js';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto.js';
import { CreateLeadActivityDto } from './dto/create-lead-activity.dto.js';
import { CreateLeadFollowUpDto } from './dto/create-lead-followup.dto.js';
import { LeadFilterQueryDto } from './dto/lead-filter-query.dto.js';
import { LeadMetricsDto } from './dto/lead-metrics.dto.js';
import { PaginatedLeadsResponseDto } from './dto/paginated-leads-response.dto.js';
import { Lead } from './entities/lead.entity.js';
import { LeadActivity } from './entities/lead-activity.entity.js';
import { LeadFollowUp } from './entities/lead-followup.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('Leads')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create or capture a new lead opportunity',
    description:
      'Creates a new sales lead. Automatically links or creates a deduplicated contact record, logs an initial lead creation timeline activity, and schedules an initial follow-up if requested.',
  })
  @ApiResponse({ status: 201, description: 'Lead created successfully', type: Lead })
  @ApiResponse({ status: 400, description: 'Invalid input or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT' })
  async create(
    @CurrentUser() user: User,
    @Body() createLeadDto: CreateLeadDto,
  ): Promise<Lead> {
    return this.leadsService.create(user.userId, createLeadDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List leads with filtering, search, and pagination',
    description:
      'Retrieve a paginated list of leads owned by the authenticated freelancer. Supports search across title, name, email, company, and service, filtering by pipeline status and source, and an overdue follow-up filter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of leads with total count',
    type: PaginatedLeadsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT' })
  async findAll(
    @CurrentUser() user: User,
    @Query() query: LeadFilterQueryDto,
  ): Promise<PaginatedLeadsResponseDto> {
    return this.leadsService.findAll(user.userId, query);
  }

  @Get('metrics')
  @ApiOperation({
    summary: 'Get summary metrics for leads dashboard',
    description:
      'Returns aggregate counts for total leads, active in-progress opportunities, follow-ups due today or overdue, and successfully converted clients.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lead dashboard metrics',
    type: LeadMetricsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT' })
  async getMetrics(@CurrentUser() user: User): Promise<LeadMetricsDto> {
    return this.leadsService.getMetrics(user.userId);
  }

  @Get(':leadId')
  @ApiOperation({
    summary: 'Get a lead by ID with contact, timeline, and follow-ups',
    description:
      'Returns detailed information for a specific lead opportunity, including associated contact details, chronological activity history, and scheduled follow-ups.',
  })
  @ApiParam({ name: 'leadId', description: 'Lead unique UUID identifier' })
  @ApiResponse({ status: 200, description: 'Lead found', type: Lead })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async findOne(
    @CurrentUser() user: User,
    @Param('leadId') leadId: string,
  ): Promise<Lead> {
    return this.leadsService.findById(user.userId, leadId);
  }

  @Patch(':leadId')
  @ApiOperation({
    summary: 'Update lead details',
    description:
      'Update editable lead properties such as title, contact information, service interest, budget, currency, description, or qualification status.',
  })
  @ApiParam({ name: 'leadId', description: 'Lead unique UUID identifier' })
  @ApiResponse({ status: 200, description: 'Lead updated successfully', type: Lead })
  @ApiResponse({ status: 400, description: 'Invalid input or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async update(
    @CurrentUser() user: User,
    @Param('leadId') leadId: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ): Promise<Lead> {
    return this.leadsService.update(user.userId, leadId, updateLeadDto);
  }

  @Patch(':leadId/status')
  @ApiOperation({
    summary: 'Update pipeline stage or record terminal outcome (converted/lost)',
    description:
      'Advances or updates the lead stage across the pipeline (new, contacted, qualified, proposal_sent, negotiation, converted, lost). Automatically appends a timeline activity, marks qualification if applicable, records lostReason when lost, and flags contact as client when converted.',
  })
  @ApiParam({ name: 'leadId', description: 'Lead unique UUID identifier' })
  @ApiResponse({
    status: 200,
    description: 'Lead status updated and activity recorded',
    type: Lead,
  })
  @ApiResponse({ status: 400, description: 'Invalid status or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async updateStatus(
    @CurrentUser() user: User,
    @Param('leadId') leadId: string,
    @Body() updateStatusDto: UpdateLeadStatusDto,
  ): Promise<Lead> {
    return this.leadsService.updateStatus(user.userId, leadId, updateStatusDto);
  }

  @Post(':leadId/convert')
  @ApiOperation({
    summary: 'Convert lead into a paying client',
    description:
      'Terminal conversion action: marks the lead as converted, updates the linked contact isClient property to true, and records a conversion event in the activity timeline.',
  })
  @ApiParam({ name: 'leadId', description: 'Lead unique UUID identifier' })
  @ApiResponse({ status: 200, description: 'Lead converted successfully', type: Lead })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async convert(
    @CurrentUser() user: User,
    @Param('leadId') leadId: string,
  ): Promise<Lead> {
    return this.leadsService.convertLead(user.userId, leadId);
  }

  @Post(':leadId/activities')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Record an activity in the lead timeline',
    description:
      'Log an interaction (call, email, meeting, note, or quotation) against this lead opportunity. Automatically updates the last contacted date.',
  })
  @ApiParam({ name: 'leadId', description: 'Lead unique UUID identifier' })
  @ApiResponse({
    status: 201,
    description: 'Activity logged successfully',
    type: LeadActivity,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async addActivity(
    @CurrentUser() user: User,
    @Param('leadId') leadId: string,
    @Body() createActivityDto: CreateLeadActivityDto,
  ): Promise<LeadActivity> {
    return this.leadsService.addActivity(user.userId, leadId, createActivityDto);
  }

  @Get(':leadId/activities')
  @ApiOperation({
    summary: 'Get chronological activity timeline for a lead',
    description:
      'Returns a list of all logged activities and automatic status events for the specified lead in reverse chronological order.',
  })
  @ApiParam({ name: 'leadId', description: 'Lead unique UUID identifier' })
  @ApiResponse({
    status: 200,
    description: 'List of activities',
    type: [LeadActivity],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async getActivities(
    @CurrentUser() user: User,
    @Param('leadId') leadId: string,
  ): Promise<LeadActivity[]> {
    return this.leadsService.getActivities(user.userId, leadId);
  }

  @Post(':leadId/followups')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Schedule a follow-up for a lead',
    description:
      'Schedule a future follow-up reminder with due date and context notes. Automatically adjusts nextFollowUpDate if this is the earliest pending reminder.',
  })
  @ApiParam({ name: 'leadId', description: 'Lead unique UUID identifier' })
  @ApiResponse({
    status: 201,
    description: 'Follow-up scheduled successfully',
    type: LeadFollowUp,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async addFollowUp(
    @CurrentUser() user: User,
    @Param('leadId') leadId: string,
    @Body() createFollowUpDto: CreateLeadFollowUpDto,
  ): Promise<LeadFollowUp> {
    return this.leadsService.addFollowUp(user.userId, leadId, createFollowUpDto);
  }

  @Patch(':leadId/followups/:followUpId/complete')
  @ApiOperation({
    summary: 'Mark a scheduled follow-up as completed',
    description:
      'Marks a follow-up as completed with completion timestamp, recalculates the next follow-up date from remaining pending tasks, and records a completion entry in the activity timeline.',
  })
  @ApiParam({ name: 'leadId', description: 'Lead unique UUID identifier' })
  @ApiParam({ name: 'followUpId', description: 'Follow-up unique UUID identifier' })
  @ApiResponse({
    status: 200,
    description: 'Follow-up completed successfully',
    type: LeadFollowUp,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Lead or follow-up not found' })
  async completeFollowUp(
    @CurrentUser() user: User,
    @Param('leadId') leadId: string,
    @Param('followUpId') followUpId: string,
  ): Promise<LeadFollowUp> {
    return this.leadsService.completeFollowUp(user.userId, leadId, followUpId);
  }

  @Delete(':leadId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a lead opportunity',
    description:
      'Permanently removes a lead opportunity along with its activities and follow-ups. The associated contact and historical client records remain preserved.',
  })
  @ApiParam({ name: 'leadId', description: 'Lead unique UUID identifier' })
  @ApiResponse({ status: 204, description: 'Lead deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async remove(
    @CurrentUser() user: User,
    @Param('leadId') leadId: string,
  ): Promise<void> {
    return this.leadsService.remove(user.userId, leadId);
  }
}

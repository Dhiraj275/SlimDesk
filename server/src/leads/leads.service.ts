import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity.js';
import { LeadActivity } from './entities/lead-activity.entity.js';
import { LeadFollowUp } from './entities/lead-followup.entity.js';
import { ContactsService } from '../contacts/contacts.service.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';
import { UpdateLeadDto } from './dto/update-lead.dto.js';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto.js';
import { CreateLeadActivityDto } from './dto/create-lead-activity.dto.js';
import { CreateLeadFollowUpDto } from './dto/create-lead-followup.dto.js';
import { LeadFilterQueryDto } from './dto/lead-filter-query.dto.js';
import { LeadStatus } from './enums/lead-status.enum.js';
import { ActivityType } from './enums/activity-type.enum.js';

export interface LeadMetrics {
  totalLeads: number;
  inProgressCount: number;
  followUpsDueCount: number;
  convertedCount: number;
}

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadsRepository: Repository<Lead>,
    @InjectRepository(LeadActivity)
    private readonly activitiesRepository: Repository<LeadActivity>,
    @InjectRepository(LeadFollowUp)
    private readonly followUpsRepository: Repository<LeadFollowUp>,
    private readonly contactsService: ContactsService,
  ) {}

  async create(userId: string, createLeadDto: CreateLeadDto): Promise<Lead> {
    let contactId = createLeadDto.contactId;

    if (contactId) {
      // Verify the contact belongs to the user
      await this.contactsService.findById(userId, contactId);
    } else {
      // Find or create reusable contact
      const contact = await this.contactsService.findOrCreate(userId, {
        name: createLeadDto.name,
        email: createLeadDto.email,
        phone: createLeadDto.phone,
        company: createLeadDto.company,
      });
      contactId = contact.contactId;
    }

    const nextFollowUpDate = createLeadDto.nextFollowUpDate
      ? new Date(createLeadDto.nextFollowUpDate)
      : null;

    const lead = this.leadsRepository.create({
      userId,
      contactId,
      title: createLeadDto.title || createLeadDto.name,
      name: createLeadDto.name,
      email: createLeadDto.email || null,
      phone: createLeadDto.phone || null,
      company: createLeadDto.company || null,
      source: createLeadDto.source,
      interestedService: createLeadDto.interestedService || null,
      estimatedBudget: createLeadDto.estimatedBudget || null,
      currency: createLeadDto.currency || 'USD',
      status: LeadStatus.NEW,
      isQualified: false,
      description: createLeadDto.description || null,
      nextFollowUpDate,
      lastContactedDate: null,
    });

    const savedLead = await this.leadsRepository.save(lead);

    // Record initial activity
    await this.activitiesRepository.save(
      this.activitiesRepository.create({
        userId,
        leadId: savedLead.leadId,
        type: ActivityType.LEAD_CREATED,
        title: 'Lead created',
        description: `Source: ${savedLead.source}${
          savedLead.interestedService ? ` · Interested in: ${savedLead.interestedService}` : ''
        }`,
        metadata: {
          source: savedLead.source,
          interestedService: savedLead.interestedService,
          estimatedBudget: savedLead.estimatedBudget,
          currency: savedLead.currency,
        },
        performedAt: new Date(),
      }),
    );

    // If an initial follow-up date was provided, schedule it
    if (nextFollowUpDate) {
      await this.followUpsRepository.save(
        this.followUpsRepository.create({
          userId,
          leadId: savedLead.leadId,
          dueDate: nextFollowUpDate,
          notes: createLeadDto.followUpNotes || null,
          isCompleted: false,
        }),
      );
    }

    return this.findById(userId, savedLead.leadId);
  }

  async findAll(
    userId: string,
    query: LeadFilterQueryDto,
  ): Promise<{ items: Lead[]; total: number }> {
    const qb = this.leadsRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.contact', 'contact')
      .leftJoinAndSelect(
        'lead.followUps',
        'followUp',
        'followUp.isCompleted = false',
      )
      .where('lead.userId = :userId', { userId });

    if (query.search) {
      qb.andWhere(
        '(lead.title LIKE :search OR lead.name LIKE :search OR lead.email LIKE :search OR lead.company LIKE :search OR lead.interestedService LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.status) {
      qb.andWhere('lead.status = :status', { status: query.status });
    }

    if (query.source) {
      qb.andWhere('lead.source = :source', { source: query.source });
    }

    if (typeof query.isQualified === 'boolean') {
      qb.andWhere('lead.isQualified = :isQualified', {
        isQualified: query.isQualified,
      });
    }

    if (query.overdueOnly) {
      qb.andWhere(
        'lead.nextFollowUpDate IS NOT NULL AND lead.nextFollowUpDate < CURRENT_TIMESTAMP AND lead.status NOT IN (:...terminalStatuses)',
        {
          terminalStatuses: [LeadStatus.CONVERTED, LeadStatus.LOST],
        },
      );
    }

    qb.orderBy('lead.updatedAt', 'DESC')
      .take(query.limit ?? 50)
      .skip(query.offset ?? 0);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async getMetrics(userId: string): Promise<LeadMetrics> {
    const totalLeads = await this.leadsRepository.count({
      where: { userId },
    });

    const inProgressCount = await this.leadsRepository
      .createQueryBuilder('lead')
      .where('lead.userId = :userId', { userId })
      .andWhere('lead.status NOT IN (:...terminalStatuses)', {
        terminalStatuses: [LeadStatus.CONVERTED, LeadStatus.LOST],
      })
      .getCount();

    const convertedCount = await this.leadsRepository.count({
      where: { userId, status: LeadStatus.CONVERTED },
    });

    const followUpsDueCount = await this.leadsRepository
      .createQueryBuilder('lead')
      .where('lead.userId = :userId', { userId })
      .andWhere('lead.nextFollowUpDate IS NOT NULL')
      .andWhere('lead.nextFollowUpDate <= CURRENT_TIMESTAMP')
      .andWhere('lead.status NOT IN (:...terminalStatuses)', {
        terminalStatuses: [LeadStatus.CONVERTED, LeadStatus.LOST],
      })
      .getCount();

    return {
      totalLeads,
      inProgressCount,
      followUpsDueCount,
      convertedCount,
    };
  }

  async findById(userId: string, leadId: string): Promise<Lead> {
    const lead = await this.leadsRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.contact', 'contact')
      .leftJoinAndSelect('lead.activities', 'activity')
      .leftJoinAndSelect('lead.followUps', 'followUp')
      .where('lead.leadId = :leadId', { leadId })
      .andWhere('lead.userId = :userId', { userId })
      .orderBy('activity.performedAt', 'DESC')
      .addOrderBy('followUp.dueDate', 'ASC')
      .getOne();

    if (!lead) {
      throw new NotFoundException(`Lead with ID "${leadId}" not found`);
    }

    return lead;
  }

  async update(
    userId: string,
    leadId: string,
    updateLeadDto: UpdateLeadDto,
  ): Promise<Lead> {
    const lead = await this.findById(userId, leadId);

    if (updateLeadDto.contactId && updateLeadDto.contactId !== lead.contactId) {
      await this.contactsService.findById(userId, updateLeadDto.contactId);
      lead.contactId = updateLeadDto.contactId;
    }

    if (updateLeadDto.title !== undefined) lead.title = updateLeadDto.title;
    if (updateLeadDto.name !== undefined) lead.name = updateLeadDto.name;
    if (updateLeadDto.email !== undefined) lead.email = updateLeadDto.email || null;
    if (updateLeadDto.phone !== undefined) lead.phone = updateLeadDto.phone || null;
    if (updateLeadDto.company !== undefined) lead.company = updateLeadDto.company || null;
    if (updateLeadDto.source !== undefined) lead.source = updateLeadDto.source;
    if (updateLeadDto.interestedService !== undefined) {
      lead.interestedService = updateLeadDto.interestedService || null;
    }
    if (updateLeadDto.estimatedBudget !== undefined) {
      lead.estimatedBudget = updateLeadDto.estimatedBudget ?? null;
    }
    if (updateLeadDto.currency !== undefined) lead.currency = updateLeadDto.currency;
    if (updateLeadDto.description !== undefined) {
      lead.description = updateLeadDto.description || null;
    }
    if (updateLeadDto.isQualified !== undefined) {
      lead.isQualified = updateLeadDto.isQualified;
    }
    if (updateLeadDto.nextFollowUpDate !== undefined) {
      lead.nextFollowUpDate = updateLeadDto.nextFollowUpDate
        ? new Date(updateLeadDto.nextFollowUpDate)
        : null;
    }

    await this.leadsRepository.save(lead);
    return this.findById(userId, leadId);
  }

  async updateStatus(
    userId: string,
    leadId: string,
    updateStatusDto: UpdateLeadStatusDto,
  ): Promise<Lead> {
    const lead = await this.findById(userId, leadId);
    const oldStatus = lead.status;
    const newStatus = updateStatusDto.status;

    lead.status = newStatus;

    if (newStatus === LeadStatus.QUALIFIED) {
      lead.isQualified = true;
    }

    if (newStatus === LeadStatus.LOST) {
      lead.lostReason = updateStatusDto.lostReason || null;
    } else {
      lead.lostReason = null;
    }

    if (newStatus === LeadStatus.CONVERTED && lead.contactId) {
      await this.contactsService.markAsClient(userId, lead.contactId);
    }

    await this.leadsRepository.save(lead);

    // Record activity
    const isConversion = newStatus === LeadStatus.CONVERTED;
    await this.activitiesRepository.save(
      this.activitiesRepository.create({
        userId,
        leadId,
        type: isConversion ? ActivityType.CONVERSION : ActivityType.STATUS_CHANGE,
        title: isConversion
          ? 'Lead converted to client'
          : `Status changed: ${oldStatus} → ${newStatus}`,
        description:
          updateStatusDto.note ||
          (newStatus === LeadStatus.LOST && updateStatusDto.lostReason
            ? `Reason: ${updateStatusDto.lostReason}`
            : null),
        metadata: {
          oldStatus,
          newStatus,
          lostReason: updateStatusDto.lostReason || null,
        },
        performedAt: new Date(),
      }),
    );

    return this.findById(userId, leadId);
  }

  async convertLead(userId: string, leadId: string): Promise<Lead> {
    return this.updateStatus(userId, leadId, {
      status: LeadStatus.CONVERTED,
      note: 'Lead converted into an active client relationship.',
    });
  }

  async addActivity(
    userId: string,
    leadId: string,
    createActivityDto: CreateLeadActivityDto,
  ): Promise<LeadActivity> {
    const lead = await this.findById(userId, leadId);

    const performedAt = createActivityDto.performedAt
      ? new Date(createActivityDto.performedAt)
      : new Date();

    const activity = this.activitiesRepository.create({
      userId,
      leadId,
      type: createActivityDto.type,
      title: createActivityDto.title,
      description: createActivityDto.description || null,
      metadata: createActivityDto.metadata || null,
      performedAt,
    });

    const savedActivity = await this.activitiesRepository.save(activity);

    // Update lastContactedDate on the lead
    lead.lastContactedDate = performedAt;
    await this.leadsRepository.save(lead);

    return savedActivity;
  }

  async getActivities(userId: string, leadId: string): Promise<LeadActivity[]> {
    await this.findById(userId, leadId);

    return this.activitiesRepository.find({
      where: { leadId, userId },
      order: { performedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  async addFollowUp(
    userId: string,
    leadId: string,
    createFollowUpDto: CreateLeadFollowUpDto,
  ): Promise<LeadFollowUp> {
    const lead = await this.findById(userId, leadId);
    const dueDate = new Date(createFollowUpDto.dueDate);

    const followUp = this.followUpsRepository.create({
      userId,
      leadId,
      dueDate,
      notes: createFollowUpDto.notes || null,
      isCompleted: false,
    });

    const savedFollowUp = await this.followUpsRepository.save(followUp);

    // Update lead nextFollowUpDate if null or if this is sooner
    if (!lead.nextFollowUpDate || dueDate < lead.nextFollowUpDate) {
      lead.nextFollowUpDate = dueDate;
      await this.leadsRepository.save(lead);
    }

    // Record timeline activity
    await this.activitiesRepository.save(
      this.activitiesRepository.create({
        userId,
        leadId,
        type: ActivityType.FOLLOW_UP,
        title: 'Follow-up scheduled',
        description:
          createFollowUpDto.notes ||
          `Scheduled for ${dueDate.toISOString().slice(0, 10)}`,
        metadata: {
          followUpId: savedFollowUp.followUpId,
          dueDate: savedFollowUp.dueDate,
        },
        performedAt: new Date(),
      }),
    );

    return savedFollowUp;
  }

  async completeFollowUp(
    userId: string,
    leadId: string,
    followUpId: string,
  ): Promise<LeadFollowUp> {
    await this.findById(userId, leadId);

    const followUp = await this.followUpsRepository.findOne({
      where: { followUpId, leadId, userId },
    });

    if (!followUp) {
      throw new NotFoundException(`Follow-up with ID "${followUpId}" not found`);
    }

    followUp.isCompleted = true;
    followUp.completedAt = new Date();
    await this.followUpsRepository.save(followUp);

    // Find next pending follow-up date for this lead
    const nextPending = await this.followUpsRepository.findOne({
      where: { leadId, userId, isCompleted: false },
      order: { dueDate: 'ASC' },
    });

    await this.leadsRepository.update(
      { leadId, userId },
      { nextFollowUpDate: nextPending ? nextPending.dueDate : null },
    );

    // Record timeline activity
    await this.activitiesRepository.save(
      this.activitiesRepository.create({
        userId,
        leadId,
        type: ActivityType.FOLLOW_UP,
        title: 'Follow-up completed',
        description: followUp.notes ? `Completed: ${followUp.notes}` : 'Completed follow-up',
        metadata: { followUpId: followUp.followUpId },
        performedAt: new Date(),
      }),
    );

    return followUp;
  }

  async remove(userId: string, leadId: string): Promise<void> {
    const lead = await this.findById(userId, leadId);
    await this.leadsRepository.remove(lead);
  }
}

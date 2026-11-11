import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { LeadsService } from './leads.service.js';
import { Lead } from './entities/lead.entity.js';
import { LeadActivity } from './entities/lead-activity.entity.js';
import { LeadFollowUp } from './entities/lead-followup.entity.js';
import { ContactsService } from '../contacts/contacts.service.js';
import { LeadStatus } from './enums/lead-status.enum.js';
import { LeadSource } from './enums/lead-source.enum.js';
import { ActivityType } from './enums/activity-type.enum.js';

describe('LeadsService', () => {
  let service: LeadsService;
  let mockLeadsRepo: any;
  let mockActivitiesRepo: any;
  let mockFollowUpsRepo: any;
  let mockContactsService: any;

  beforeEach(async () => {
    mockLeadsRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      count: vi.fn(),
      create: vi.fn().mockImplementation((dto) => dto),
      save: vi.fn().mockImplementation((lead) =>
        Promise.resolve({
          leadId: lead.leadId || 'lead-uuid-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          ...lead,
        }),
      ),
      update: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
      createQueryBuilder: vi.fn(),
    };

    mockActivitiesRepo = {
      create: vi.fn().mockImplementation((dto) => dto),
      save: vi.fn().mockImplementation((act) =>
        Promise.resolve({
          activityId: 'activity-uuid-1',
          createdAt: new Date(),
          ...act,
        }),
      ),
      find: vi.fn(),
    };

    mockFollowUpsRepo = {
      create: vi.fn().mockImplementation((dto) => dto),
      save: vi.fn().mockImplementation((fu) =>
        Promise.resolve({
          followUpId: 'followup-uuid-1',
          createdAt: new Date(),
          ...fu,
        }),
      ),
      findOne: vi.fn(),
      find: vi.fn(),
    };

    mockContactsService = {
      findById: vi.fn(),
      findOrCreate: vi.fn().mockResolvedValue({
        contactId: 'contact-uuid-1',
        name: 'Acme Studio',
        email: 'hello@acme.com',
      }),
      markAsClient: vi.fn().mockResolvedValue({
        contactId: 'contact-uuid-1',
        isClient: true,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: getRepositoryToken(Lead),
          useValue: mockLeadsRepo,
        },
        {
          provide: getRepositoryToken(LeadActivity),
          useValue: mockActivitiesRepo,
        },
        {
          provide: getRepositoryToken(LeadFollowUp),
          useValue: mockFollowUpsRepo,
        },
        {
          provide: ContactsService,
          useValue: mockContactsService,
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a lead with auto-linked contact and initial activity', async () => {
      // Mock findById called internally at end of create
      const savedLeadObj = {
        leadId: 'lead-uuid-1',
        userId: 'user-1',
        name: 'Acme Studio',
        contactId: 'contact-uuid-1',
        status: LeadStatus.NEW,
        activities: [],
        followUps: [],
      };

      const qbMock: any = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        addOrderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(savedLeadObj),
      };
      mockLeadsRepo.createQueryBuilder.mockReturnValue(qbMock);

      const result = await service.create('user-1', {
        name: 'Acme Studio',
        email: 'hello@acme.com',
        source: LeadSource.WEBSITE,
        interestedService: 'Web App',
        estimatedBudget: 15000,
      });

      expect(mockContactsService.findOrCreate).toHaveBeenCalledWith('user-1', {
        name: 'Acme Studio',
        email: 'hello@acme.com',
        phone: undefined,
        company: undefined,
      });
      expect(mockLeadsRepo.save).toHaveBeenCalled();
      expect(mockActivitiesRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ActivityType.LEAD_CREATED,
          leadId: 'lead-uuid-1',
        }),
      );
      expect(result.leadId).toBe('lead-uuid-1');
    });

    it('should schedule follow-up if nextFollowUpDate is provided', async () => {
      const qbMock: any = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        addOrderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue({ leadId: 'lead-uuid-1' }),
      };
      mockLeadsRepo.createQueryBuilder.mockReturnValue(qbMock);

      await service.create('user-1', {
        name: 'John Smith',
        nextFollowUpDate: '2026-11-05T10:00:00.000Z',
        followUpNotes: 'Check proposal feedback',
      });

      expect(mockFollowUpsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          leadId: 'lead-uuid-1',
          notes: 'Check proposal feedback',
          isCompleted: false,
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return lead if found', async () => {
      const mockLead = { leadId: 'lead-1', userId: 'user-1', name: 'Test Lead' };
      const qbMock: any = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        addOrderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(mockLead),
      };
      mockLeadsRepo.createQueryBuilder.mockReturnValue(qbMock);

      const result = await service.findById('user-1', 'lead-1');
      expect(result).toEqual(mockLead);
    });

    it('should throw NotFoundException if lead not found', async () => {
      const qbMock: any = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        addOrderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(null),
      };
      mockLeadsRepo.createQueryBuilder.mockReturnValue(qbMock);

      await expect(service.findById('user-1', 'missing-lead')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should transition status to QUALIFIED and set isQualified to true', async () => {
      const existingLead = {
        leadId: 'lead-1',
        userId: 'user-1',
        status: LeadStatus.NEW,
        isQualified: false,
        contactId: 'contact-1',
      };

      const qbMock: any = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        addOrderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(existingLead),
      };
      mockLeadsRepo.createQueryBuilder.mockReturnValue(qbMock);

      const result = await service.updateStatus('user-1', 'lead-1', {
        status: LeadStatus.QUALIFIED,
        note: 'Budget verified',
      });

      expect(result.status).toBe(LeadStatus.QUALIFIED);
      expect(result.isQualified).toBe(true);
      expect(mockActivitiesRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ActivityType.STATUS_CHANGE,
          title: 'Status changed: new → qualified',
        }),
      );
    });

    it('should transition to CONVERTED and mark contact as client', async () => {
      const existingLead = {
        leadId: 'lead-1',
        userId: 'user-1',
        status: LeadStatus.PROPOSAL_SENT,
        contactId: 'contact-1',
      };

      const qbMock: any = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        addOrderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(existingLead),
      };
      mockLeadsRepo.createQueryBuilder.mockReturnValue(qbMock);

      await service.updateStatus('user-1', 'lead-1', {
        status: LeadStatus.CONVERTED,
        note: 'Contract signed',
      });

      expect(mockContactsService.markAsClient).toHaveBeenCalledWith('user-1', 'contact-1');
      expect(mockActivitiesRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ActivityType.CONVERSION,
          title: 'Lead converted to client',
        }),
      );
    });

    it('should record lostReason when status is marked LOST', async () => {
      const existingLead = {
        leadId: 'lead-1',
        userId: 'user-1',
        status: LeadStatus.NEGOTIATION,
        lostReason: null,
      };

      const qbMock: any = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        addOrderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(existingLead),
      };
      mockLeadsRepo.createQueryBuilder.mockReturnValue(qbMock);

      const result = await service.updateStatus('user-1', 'lead-1', {
        status: LeadStatus.LOST,
        lostReason: 'Client froze budget',
      });

      expect(result.status).toBe(LeadStatus.LOST);
      expect(result.lostReason).toBe('Client froze budget');
    });
  });

  describe('addFollowUp & completeFollowUp', () => {
    it('should add follow-up and update lead nextFollowUpDate', async () => {
      const lead = {
        leadId: 'lead-1',
        userId: 'user-1',
        nextFollowUpDate: null,
      };

      const qbMock: any = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        addOrderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(lead),
      };
      mockLeadsRepo.createQueryBuilder.mockReturnValue(qbMock);

      const followUp = await service.addFollowUp('user-1', 'lead-1', {
        dueDate: '2026-11-10T12:00:00.000Z',
        notes: 'Follow-up regarding quote',
      });

      expect(followUp.followUpId).toBe('followup-uuid-1');
      expect(lead.nextFollowUpDate).toEqual(new Date('2026-11-10T12:00:00.000Z'));
      expect(mockLeadsRepo.update).toHaveBeenCalledWith(
        { leadId: 'lead-1', userId: 'user-1' },
        { nextFollowUpDate: new Date('2026-11-10T12:00:00.000Z') },
      );
    });

    it('should complete follow-up and update next follow-up date', async () => {
      const lead = { leadId: 'lead-1', userId: 'user-1' };
      const qbMock: any = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        addOrderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(lead),
      };
      mockLeadsRepo.createQueryBuilder.mockReturnValue(qbMock);

      const existingFollowUp = {
        followUpId: 'fu-1',
        leadId: 'lead-1',
        userId: 'user-1',
        isCompleted: false,
      };
      mockFollowUpsRepo.findOne
        .mockResolvedValueOnce(existingFollowUp) // find the follow-up
        .mockResolvedValueOnce(null); // find next pending

      const result = await service.completeFollowUp('user-1', 'lead-1', 'fu-1');

      expect(result.isCompleted).toBe(true);
      expect(mockLeadsRepo.update).toHaveBeenCalledWith(
        { leadId: 'lead-1', userId: 'user-1' },
        { nextFollowUpDate: null },
      );
    });
  });

  describe('addActivity', () => {
    it('should save activity and update lead lastContactedDate', async () => {
      const lead = {
        leadId: 'lead-1',
        userId: 'user-1',
        lastContactedDate: null,
      };

      const qbMock: any = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        addOrderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(lead),
      };
      mockLeadsRepo.createQueryBuilder.mockReturnValue(qbMock);

      const activity = await service.addActivity('user-1', 'lead-1', {
        type: ActivityType.CALL,
        title: 'Discussed project requirements',
      });

      expect(activity.activityId).toBe('activity-uuid-1');
      expect(lead.lastContactedDate).toBeDefined();
      expect(mockLeadsRepo.update).toHaveBeenCalledWith(
        { leadId: 'lead-1', userId: 'user-1' },
        { lastContactedDate: expect.any(Date) },
      );
    });
  });

  describe('getMetrics', () => {
    it('should return metrics for total, inProgress, followUpsDue, converted', async () => {
      mockLeadsRepo.count
        .mockResolvedValueOnce(24) // totalLeads
        .mockResolvedValueOnce(5); // convertedCount

      const inProgressQb: any = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getCount: vi.fn().mockResolvedValue(8),
      };
      const followUpQb: any = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getCount: vi.fn().mockResolvedValue(3),
      };

      mockLeadsRepo.createQueryBuilder
        .mockReturnValueOnce(inProgressQb)
        .mockReturnValueOnce(followUpQb);

      const metrics = await service.getMetrics('user-1');

      expect(metrics).toEqual({
        totalLeads: 24,
        inProgressCount: 8,
        followUpsDueCount: 3,
        convertedCount: 5,
      });
    });
  });
});

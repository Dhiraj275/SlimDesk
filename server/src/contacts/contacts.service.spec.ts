import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ContactsService } from './contacts.service.js';
import { Contact } from './entities/contact.entity.js';

describe('ContactsService', () => {
  let service: ContactsService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn().mockImplementation((dto) => dto),
      save: vi.fn().mockImplementation((contact) =>
        Promise.resolve({
          contactId: 'contact-uuid-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          ...contact,
        }),
      ),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: getRepositoryToken(Contact),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a contact scoped to userId', async () => {
      const result = await service.create('user-1', {
        name: 'Acme Studio',
        email: 'acme@example.com',
        phone: '+1 555 1234',
        company: 'Acme Studio LLC',
      });

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'Acme Studio',
        email: 'acme@example.com',
        phone: '+1 555 1234',
        company: 'Acme Studio LLC',
        userId: 'user-1',
      });
      expect(result.contactId).toBe('contact-uuid-1');
      expect(result.name).toBe('Acme Studio');
    });
  });

  describe('findOrCreate', () => {
    it('should return existing contact if matching email found', async () => {
      const existing = { contactId: 'existing-contact', email: 'acme@example.com', name: 'Acme' };
      mockRepository.findOne.mockResolvedValueOnce(existing);

      const result = await service.findOrCreate('user-1', {
        name: 'Acme Corp',
        email: 'acme@example.com',
      });

      expect(result).toEqual(existing);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should return existing contact if matching name found and no email match', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(null) // by email
        .mockResolvedValueOnce({ contactId: 'name-contact', name: 'Acme Corp' }); // by name

      const result = await service.findOrCreate('user-1', {
        name: 'Acme Corp',
        email: 'newemail@example.com',
      });

      expect(result.contactId).toBe('name-contact');
    });

    it('should create new contact if no existing match found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOrCreate('user-1', {
        name: 'Brand New',
        email: 'brandnew@example.com',
      });

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        name: 'Brand New',
        email: 'brandnew@example.com',
        phone: null,
        company: null,
        isClient: false,
      });
      expect(result.contactId).toBe('contact-uuid-1');
    });
  });

  describe('findById', () => {
    it('should return contact if found and owned by user', async () => {
      const contact = { contactId: 'c1', userId: 'user-1', name: 'Test' };
      mockRepository.findOne.mockResolvedValue(contact);

      const result = await service.findById('user-1', 'c1');
      expect(result).toEqual(contact);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findById('user-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAsClient', () => {
    it('should update isClient to true', async () => {
      const contact = { contactId: 'c1', userId: 'user-1', name: 'Test', isClient: false };
      mockRepository.findOne.mockResolvedValue(contact);

      const result = await service.markAsClient('user-1', 'c1');
      expect(result.isClient).toBe(true);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove contact', async () => {
      const contact = { contactId: 'c1', userId: 'user-1' };
      mockRepository.findOne.mockResolvedValue(contact);

      await service.remove('user-1', 'c1');
      expect(mockRepository.remove).toHaveBeenCalledWith(contact);
    });
  });
});

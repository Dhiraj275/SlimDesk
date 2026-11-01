import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactsRepository: Repository<Contact>,
  ) {}

  async create(userId: string, createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactsRepository.create({
      ...createContactDto,
      userId,
    });
    return this.contactsRepository.save(contact);
  }

  async findAll(userId: string, isClient?: boolean): Promise<Contact[]> {
    const where: any = { userId };
    if (typeof isClient === 'boolean') {
      where.isClient = isClient;
    }
    return this.contactsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(userId: string, contactId: string): Promise<Contact> {
    const contact = await this.contactsRepository.findOne({
      where: { contactId, userId },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID "${contactId}" not found`);
    }

    return contact;
  }

  async findOrCreate(
    userId: string,
    data: { name: string; email?: string; phone?: string; company?: string },
  ): Promise<Contact> {
    if (data.email) {
      const existing = await this.contactsRepository.findOne({
        where: { userId, email: data.email },
      });
      if (existing) {
        return existing;
      }
    }

    const byName = await this.contactsRepository.findOne({
      where: { userId, name: data.name },
    });
    if (byName) {
      return byName;
    }

    const contact = this.contactsRepository.create({
      userId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      isClient: false,
    });

    return this.contactsRepository.save(contact);
  }

  async update(
    userId: string,
    contactId: string,
    updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
    const contact = await this.findById(userId, contactId);
    Object.assign(contact, updateContactDto);
    return this.contactsRepository.save(contact);
  }

  async markAsClient(userId: string, contactId: string): Promise<Contact> {
    const contact = await this.findById(userId, contactId);
    contact.isClient = true;
    return this.contactsRepository.save(contact);
  }

  async remove(userId: string, contactId: string): Promise<void> {
    const contact = await this.findById(userId, contactId);
    await this.contactsRepository.remove(contact);
  }
}

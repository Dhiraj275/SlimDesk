import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity.js';

@Injectable()
export class InvoiceNumberService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async generateNextNumber(userId: string, issueDate?: string): Promise<string> {
    const year = issueDate
      ? new Date(issueDate).getFullYear()
      : new Date().getFullYear();
    const prefix = `INV-${year}-`;

    const lastInvoice = await this.invoiceRepository
      .createQueryBuilder('i')
      .where('i.userId = :userId', { userId })
      .andWhere('i.invoiceNumber LIKE :pattern', { pattern: `${prefix}%` })
      .orderBy('i.createdAt', 'DESC')
      .getOne();

    let nextSeq = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const match = lastInvoice.invoiceNumber.match(/INV-\d{4}-(\d+)/);
      if (match && match[1]) {
        nextSeq = parseInt(match[1], 10) + 1;
      }
    }

    const padded = String(nextSeq).padStart(3, '0');
    return `${prefix}${padded}`;
  }
}


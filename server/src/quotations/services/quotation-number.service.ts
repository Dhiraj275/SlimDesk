import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quotation } from '../entities/quotation.entity.js';

@Injectable()
export class QuotationNumberService {
  constructor(
    @InjectRepository(Quotation)
    private readonly quotationRepository: Repository<Quotation>,
  ) {}

  async generateNextNumber(userId: string, issueDate?: string): Promise<string> {
    const year = issueDate
      ? new Date(issueDate).getFullYear()
      : new Date().getFullYear();
    const prefix = `QT-${year}-`;

    // Find the latest quotation starting with prefix for this user
    const lastQuotation = await this.quotationRepository
      .createQueryBuilder('q')
      .where('q.userId = :userId', { userId })
      .andWhere('q.quotationNumber LIKE :pattern', { pattern: `${prefix}%` })
      .orderBy('q.createdAt', 'DESC')
      .getOne();

    let nextSeq = 1;
    if (lastQuotation && lastQuotation.quotationNumber) {
      const match = lastQuotation.quotationNumber.match(/QT-\d{4}-(\d+)/);
      if (match && match[1]) {
        nextSeq = parseInt(match[1], 10) + 1;
      }
    }

    const padded = String(nextSeq).padStart(3, '0');
    return `${prefix}${padded}`;
  }
}

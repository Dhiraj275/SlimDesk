import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Quotation } from './entities/quotation.entity.js';
import { QuotationItem } from './entities/quotation-item.entity.js';
import { QuotationVersion } from './entities/quotation-version.entity.js';
import { Invoice } from '../invoices/entities/invoice.entity.js';
import { QuotationsController } from './controllers/quotations.controller.js';
import { PublicQuotationsController } from './controllers/public-quotations.controller.js';
import { QuotationsService } from './services/quotations.service.js';
import { QuotationCalculatorService } from './services/quotation-calculator.service.js';
import { QuotationNumberService } from './services/quotation-number.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quotation,
      QuotationItem,
      QuotationVersion,
      Invoice,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [QuotationsController, PublicQuotationsController],
  providers: [
    QuotationsService,
    QuotationCalculatorService,
    QuotationNumberService,
  ],
  exports: [QuotationsService, QuotationCalculatorService],
})
export class QuotationsModule {}

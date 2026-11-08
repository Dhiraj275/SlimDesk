import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Invoice } from './entities/invoice.entity.js';
import { InvoiceItem } from './entities/invoice-item.entity.js';
import { InvoicePayment } from './entities/invoice-payment.entity.js';
import { InvoiceEvent } from './entities/invoice-event.entity.js';
import { Quotation } from '../quotations/entities/quotation.entity.js';
import { InvoicesController } from './controllers/invoices.controller.js';
import { PublicInvoicesController } from './controllers/public-invoices.controller.js';
import { InvoicesService } from './services/invoices.service.js';
import { InvoiceCalculatorService } from './services/invoice-calculator.service.js';
import { InvoiceNumberService } from './services/invoice-number.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceItem,
      InvoicePayment,
      InvoiceEvent,
      Quotation,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [InvoicesController, PublicInvoicesController],
  providers: [
    InvoicesService,
    InvoiceCalculatorService,
    InvoiceNumberService,
  ],
  exports: [InvoicesService, InvoiceCalculatorService],
})
export class InvoicesModule {}


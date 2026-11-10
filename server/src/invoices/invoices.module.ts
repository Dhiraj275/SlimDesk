import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Invoice } from './entities/invoice.entity.js';
import { InvoiceItem } from './entities/invoice-item.entity.js';
import { InvoicePayment } from './entities/invoice-payment.entity.js';
import { InvoiceEvent } from './entities/invoice-event.entity.js';
import { PaymentReceipt } from './entities/payment-receipt.entity.js';
import { Quotation } from '../quotations/entities/quotation.entity.js';
import { QuotationInvoiceAllocation } from '../quotations/entities/quotation-invoice-allocation.entity.js';
import { InvoicesController } from './controllers/invoices.controller.js';
import { PublicInvoicesController } from './controllers/public-invoices.controller.js';
import { ReceiptsController } from './controllers/receipts.controller.js';
import { PublicReceiptsController } from './controllers/public-receipts.controller.js';
import { InvoicesService } from './services/invoices.service.js';
import { InvoiceCalculatorService } from './services/invoice-calculator.service.js';
import { InvoiceNumberService } from './services/invoice-number.service.js';
import { SettingsModule } from '../settings/settings.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceItem,
      InvoicePayment,
      InvoiceEvent,
      PaymentReceipt,
      Quotation,
      QuotationInvoiceAllocation,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    SettingsModule,
  ],
  controllers: [
    InvoicesController,
    PublicInvoicesController,
    ReceiptsController,
    PublicReceiptsController,
  ],
  providers: [
    InvoicesService,
    InvoiceCalculatorService,
    InvoiceNumberService,
  ],
  exports: [InvoicesService, InvoiceCalculatorService],
})
export class InvoicesModule {}


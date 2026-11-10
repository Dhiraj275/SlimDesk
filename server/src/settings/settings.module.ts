import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { BusinessProfile } from './entities/business-profile.entity.js';
import { PaymentProfile } from './entities/payment-profile.entity.js';
import { ServiceItem } from './entities/service-item.entity.js';
import { DocumentSnippet } from './entities/document-snippet.entity.js';
import { DocumentNumberSequence } from './entities/document-number-sequence.entity.js';
import { SettingsController } from './controllers/settings.controller.js';
import { SettingsService } from './services/settings.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusinessProfile,
      PaymentProfile,
      ServiceItem,
      DocumentSnippet,
      DocumentNumberSequence,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}


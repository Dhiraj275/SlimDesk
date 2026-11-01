import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Lead } from './entities/lead.entity.js';
import { LeadActivity } from './entities/lead-activity.entity.js';
import { LeadFollowUp } from './entities/lead-followup.entity.js';
import { LeadsService } from './leads.service.js';
import { LeadsController } from './leads.controller.js';
import { ContactsModule } from '../contacts/contacts.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead, LeadActivity, LeadFollowUp]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ContactsModule,
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}

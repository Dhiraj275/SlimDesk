import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SlimDesk API')
    .setDescription(
      `## Overview
SlimDesk is an all-in-one platform for modern freelancers to manage leads, contacts, proposals, and client conversions.

### Core Capabilities
- **Authentication**: JWT-based sign up, login, and bearer authentication.
- **Lead Capture & Pipeline**: Track prospective clients across stages (*new*, *contacted*, *qualified*, *proposal_sent*, *negotiation*, *converted*, *lost*).
- **Reusable Contacts**: Unified contact book that links sales opportunities without duplicate people records.
- **Follow-up Management**: Scheduled reminders, context notes, overdue calculations, and automated status syncing.
- **Quotations**: Commercial proposals, optional GST & flat tax calculations, snapshot versioning, public client approval portal, and invoice conversion.
- **Invoices & Billing**: Independent billing, quotation conversion, multi-method payment recording (UPI, bank transfer, cash), separate lifecycle & payment progress statuses, chronological event timeline, and payment reminders.
- **Settings & Document Defaults**: Reusable business identity, branding, GSTIN, payment profiles (bank accounts/UPI), services catalog, terms/notes library, and sequential numbering.
- **Payment Receipts**: Official receipts (RCT-YYYY-001) generated for completed payments with client shareable links.
- **Activity Timeline**: Full chronological event history capturing calls, meetings, notes, quotes, status transitions, and client conversions.
- **Dashboard Metrics**: Real-time pipeline counters and actionable follow-up indicators.

### Authentication
Endpoints marked with **BearerAuth** require a valid JWT passed in the \`Authorization\` header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\``,
    )
    .setVersion('1.0.0')
    .addTag(
      'Auth',
      'Authentication endpoints for registration, login, and user identity verification.',
    )
    .addTag(
      'Users',
      'User management, role-based authorization, and profile endpoints.',
    )
    .addTag(
      'Leads',
      'Lead lifecycle, pipeline transitions, qualification, follow-ups, activity logging, and metrics.',
    )
    .addTag(
      'Contacts',
      'Reusable contact directory linking client opportunities and communication details.',
    )
    .addTag(
      'Quotations',
      'Commercial quotation management, dynamic deliverables, optional taxes, versioning, and client dispatch.',
    )
    .addTag(
      'Public Quotations',
      'Unauthenticated client portal for inspecting, approving, or declining commercial proposals.',
    )
    .addTag(
      'Invoices',
      'Invoice creation, quotation conversion, issuance immutability, manual payment recording, refunds, and reminders.',
    )
    .addTag(
      'Public Invoices',
      'Unauthenticated client portal for reviewing issued invoices, bank/UPI payment instructions, and receipts.',
    )
    .addTag(
      'Settings & Document Defaults',
      'Reusable business profile identity, branding, GSTIN, payment profiles, services catalog, snippet library, and number sequences.',
    )
    .addTag(
      'Receipts',
      'Sequential payment receipt management, history, and generation for completed invoice payments.',
    )
    .addTag(
      'Public Receipts',
      'Unauthenticated client portal for viewing payment receipts and acknowledgements.',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Provide your JWT bearer token in the format: Bearer <token>',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
    },
    customSiteTitle: 'SlimDesk API Documentation',
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
}
await bootstrap();

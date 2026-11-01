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

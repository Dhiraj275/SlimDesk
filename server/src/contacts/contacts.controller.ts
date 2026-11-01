import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ContactsService } from './contacts.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import { Contact } from './entities/contact.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('Contacts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new contact',
    description:
      'Creates a new person or organization contact scoped to the authenticated freelancer. Contacts represent reusable people entities that can have multiple opportunities and projects.',
  })
  @ApiResponse({ status: 201, description: 'Contact created successfully', type: Contact })
  @ApiResponse({ status: 400, description: 'Invalid input or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT' })
  async create(
    @CurrentUser() user: User,
    @Body() createContactDto: CreateContactDto,
  ): Promise<Contact> {
    return this.contactsService.create(user.userId, createContactDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List contacts owned by the current freelancer',
    description:
      'Retrieve all contacts owned by the current user. Allows filtering by whether the contact has become a paying client (isClient = true/false).',
  })
  @ApiQuery({
    name: 'isClient',
    required: false,
    type: Boolean,
    description: 'Filter contacts by whether they are active paying clients',
  })
  @ApiResponse({ status: 200, description: 'List of contacts', type: [Contact] })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT' })
  async findAll(
    @CurrentUser() user: User,
    @Query('isClient') isClient?: string,
  ): Promise<Contact[]> {
    const isClientBool =
      isClient === 'true' ? true : isClient === 'false' ? false : undefined;
    return this.contactsService.findAll(user.userId, isClientBool);
  }

  @Get(':contactId')
  @ApiOperation({
    summary: 'Get a single contact by contactId',
    description: 'Retrieve full contact details for a specific contact UUID.',
  })
  @ApiParam({ name: 'contactId', description: 'Contact unique UUID identifier' })
  @ApiResponse({ status: 200, description: 'Contact found', type: Contact })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async findOne(
    @CurrentUser() user: User,
    @Param('contactId') contactId: string,
  ): Promise<Contact> {
    return this.contactsService.findById(user.userId, contactId);
  }

  @Patch(':contactId')
  @ApiOperation({
    summary: 'Update contact details',
    description:
      'Update contact name, email, phone number, company, or client relationship status.',
  })
  @ApiParam({ name: 'contactId', description: 'Contact unique UUID identifier' })
  @ApiResponse({ status: 200, description: 'Contact updated successfully', type: Contact })
  @ApiResponse({ status: 400, description: 'Invalid input or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async update(
    @CurrentUser() user: User,
    @Param('contactId') contactId: string,
    @Body() updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
    return this.contactsService.update(user.userId, contactId, updateContactDto);
  }

  @Delete(':contactId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a contact',
    description:
      'Permanently deletes a contact record. Associated leads will retain their historical lead details while disassociating contact foreign keys.',
  })
  @ApiParam({ name: 'contactId', description: 'Contact unique UUID identifier' })
  @ApiResponse({ status: 204, description: 'Contact deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async remove(
    @CurrentUser() user: User,
    @Param('contactId') contactId: string,
  ): Promise<void> {
    return this.contactsService.remove(user.userId, contactId);
  }
}

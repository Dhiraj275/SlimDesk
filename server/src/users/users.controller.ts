import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../auth/enums/role.enum.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: User })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin access required' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all users', type: [User] })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin access required' })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get a user by userId (Owner or Admin)' })
  @ApiParam({ name: 'userId', description: 'User unique UUID identifier' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 403, description: 'Forbidden: Cannot view other users' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    if (currentUser.role !== Role.ADMIN && currentUser.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this user');
    }
    return this.usersService.findById(userId);
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Update a user by userId (Owner or Admin)' })
  @ApiParam({ name: 'userId', description: 'User unique UUID identifier' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: User })
  @ApiResponse({ status: 403, description: 'Forbidden: Cannot update other users' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    if (currentUser.role !== Role.ADMIN && currentUser.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this user');
    }

    if (updateUserDto.role && currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only administrators can modify user roles');
    }

    return this.usersService.update(userId, updateUserDto);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user by userId (Owner or Admin)' })
  @ApiParam({ name: 'userId', description: 'User unique UUID identifier' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Cannot delete other users' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    if (currentUser.role !== Role.ADMIN && currentUser.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this user');
    }
    return this.usersService.remove(userId);
  }
}

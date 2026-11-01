import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';
import { Role } from './enums/role.enum.js';

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: any;
  let mockJwtService: any;

  const mockUser: User = {
    userId: 'uuid-123',
    displayName: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: Role.USER,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockUsersService = {
      create: vi.fn(),
      findByEmailWithPassword: vi.fn(),
      findById: vi.fn(),
    };

    mockJwtService = {
      sign: vi.fn().mockReturnValue('mock.jwt.token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should create a user and return an auth token', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.signup({
        displayName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockUsersService.create).toHaveBeenCalledWith({
        displayName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'uuid-123',
        email: 'test@example.com',
        role: Role.USER,
      });
      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.data.token).toBe('mock.jwt.token');
    });
  });

  describe('signin', () => {
    it('should return auth response on valid credentials', async () => {
      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      mockUsersService.findByEmailWithPassword.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      const result = await service.signin({
        email: 'test@example.com',
        password: plainPassword,
      });

      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.data.token).toBe('mock.jwt.token');
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.signin({
          email: 'unknown@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      const hashedPassword = await bcrypt.hash('correctPassword', 10);
      mockUsersService.findByEmailWithPassword.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      await expect(
        service.signin({
          email: 'test@example.com',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

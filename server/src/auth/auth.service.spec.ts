import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';
import { Role } from './enums/role.enum.js';

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: any;
  let mockJwtService: any;
  let mockConfigService: any;

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
      verify: vi.fn(),
    };

    mockConfigService = {
      get: vi.fn().mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'JWT_SECRET') return 'mock_secret';
        if (key === 'JWT_EXPIRES_IN') return '15m';
        if (key === 'JWT_REFRESH_SECRET') return 'mock_refresh_secret';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
        return defaultValue;
      }),
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
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should create a user and return an auth token pair', async () => {
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
      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.refreshToken).toBe('mock.jwt.token');
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
      expect(result.refreshToken).toBe('mock.jwt.token');
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

  describe('refreshToken', () => {
    it('should refresh tokens when valid refresh token is passed', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'uuid-123' });
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await service.refreshToken('valid.refresh.token');

      expect(mockJwtService.verify).toHaveBeenCalledWith('valid.refresh.token', {
        secret: 'mock_refresh_secret',
      });
      expect(mockUsersService.findById).toHaveBeenCalledWith('uuid-123');
      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.refreshToken).toBe('mock.jwt.token');
    });

    it('should throw UnauthorizedException on invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(
        service.refreshToken('invalid.token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { User } from './entities/user.entity.js';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn().mockImplementation((dto) => dto),
      save: vi.fn().mockImplementation((user) => Promise.resolve({ userId: 'uuid-123', createdAt: new Date(), ...user })),
      remove: vi.fn().mockResolvedValue(undefined),
      createQueryBuilder: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new user with hashed password', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.create({
        displayName: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
      expect(result.displayName).toBe('John Doe');
      expect(result.password).not.toBe('password123');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockRepository.findOne.mockResolvedValue({ userId: 'existing-id' });

      await expect(
        service.create({
          displayName: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const mockUser = { userId: 'uuid-123', email: 'john@example.com', displayName: 'John Doe' };
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('uuid-123');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [{ userId: '1', displayName: 'User 1' }];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
    });
  });

  describe('remove', () => {
    it('should remove user if found', async () => {
      const mockUser = { userId: 'uuid-123' };
      mockRepository.findOne.mockResolvedValue(mockUser);

      await service.remove('uuid-123');
      expect(mockRepository.remove).toHaveBeenCalledWith(mockUser);
    });
  });
});

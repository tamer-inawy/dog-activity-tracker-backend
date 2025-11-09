import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'Test@1234',
        firstName: 'John',
        lastName: 'Doe',
      };

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = {
        id: 1,
        email: createUserDto.email,
        passwordHash: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(newUser as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(newUser as any);

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result.passwordHash).not.toBe(createUserDto.password);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'Test@1234',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({ id: 1 } as any);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should validate password strength', async () => {
      const weakPassword = {
        email: 'test@example.com',
        password: '123',
      };

      await expect(service.create(weakPassword)).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const invalidEmail = {
        email: 'not-an-email',
        password: 'Test@1234',
      };

      await expect(service.create(invalidEmail)).rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);

      const result = await service.findByEmail('test@example.com');

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
    });

    it('should return null if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const user = { id: 1, email: 'test@example.com' };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);

      const result = await service.findById(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user profile', async () => {
      const userId = 1;
      const updateDto = { firstName: 'Jane', lastName: 'Smith' };
      const user = {
        id: userId,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue({ ...user, ...updateDto } as any);

      const result = await service.update(userId, updateDto);

      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Smith');
    });

    it('should not allow email update', async () => {
      const updateDto = { email: 'newemail@example.com' };

      await expect(service.update(1, updateDto)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({ id: 1 } as any);
      jest.spyOn(userRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      await service.delete(1);

      expect(userRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            validatePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should register a new user and return access token', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Test@1234',
        firstName: 'John',
        lastName: 'Doe',
      };

      const newUser = { id: 1, email: registerDto.email, ...registerDto };

      jest.spyOn(usersService, 'create').mockResolvedValue(newUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt_token');

      const result = await authService.register(registerDto);

      expect(result).toBeDefined();
      expect(result.access_token).toBe('jwt_token');
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(registerDto.email);
    });

    it('should throw error if registration fails', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'Test@1234',
      };

      jest.spyOn(usersService, 'create').mockRejectedValue(new BadRequestException());

      await expect(authService.register(registerDto)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Test@1234',
      };

      const user = { id: 1, email: loginDto.email, passwordHash: 'hashed' };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user as any);
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt_token');

      const result = await authService.login(loginDto);

      expect(result).toBeDefined();
      expect(result.access_token).toBe('jwt_token');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'Test@1234',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      const user = { id: 1, email: loginDto.email, passwordHash: 'hashed' };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user as any);
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateToken', () => {
    it('should validate JWT token successfully', async () => {
      const token = 'valid_jwt_token';
      const payload = { sub: 1, email: 'test@example.com' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(payload as any);

      const result = await authService.validateToken(token);

      expect(result).toBeDefined();
      expect(result.sub).toBe(1);
    });

    it('should throw error for invalid token', () => {
      const token = 'invalid_jwt_token';

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => authService.validateToken(token)).toThrow();
    });
  });
});

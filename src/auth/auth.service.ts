import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const user = await this.usersService.create(registerDto);

    const access_token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async login(loginDto: { email: string; password: string }) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const access_token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  validateToken(token: string) {
    return this.jwtService.verify(token);
  }

  async getCurrentUser(userId: number) {
    return this.usersService.findById(userId);
  }
}

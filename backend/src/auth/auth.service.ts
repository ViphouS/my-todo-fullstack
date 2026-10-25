import { createHash, randomUUID } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service.js';
import type { AuthUser } from './auth-user.js';
import { RegisterDto } from './dto/register.dto.js';
import { RefreshToken } from './entities/refresh-token.entity.js';

export const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwt: JwtService,
    private config: ConfigService,
    @InjectRepository(RefreshToken)
    private refreshTokens: Repository<RefreshToken>,
  ) { }

  async register({ email, password }: RegisterDto) {
    const passwordHash = await argon2.hash(password);
    return this.usersService.create(email, passwordHash);
  }

  async validate(email: string, password: string) {
    const user = await this.usersService.findByEmailWithHash(email);
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  me(userId: number) {
    return this.usersService.findById(userId);
  }

  async issueTokens(user: AuthUser) {
    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role });
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jti: randomUUID() },
      { secret: this.refreshSecret, expiresIn: REFRESH_TTL_MS / 1000 },
    );
    await this.refreshTokens.save({ userId: user.id, tokenHash: hashToken(refreshToken) });
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) throw new UnauthorizedException();
    const payload = await this.jwt
      .verifyAsync<{ sub: number }>(refreshToken, { secret: this.refreshSecret })
      .catch(() => {
        throw new UnauthorizedException();
      });
    const { affected } = await this.refreshTokens.delete({ tokenHash: hashToken(refreshToken) });
    if (!affected) {
      await this.revokeAll(payload.sub);
      throw new UnauthorizedException();
    }
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return this.issueTokens(user);
  }

  async revokeAll(userId: number) {
    await this.refreshTokens.delete({ userId });
  }

  private get refreshSecret() {
    return this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
  }
}

import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { UsersService } from '../users/users.service.js';
import { Role } from '../users/role.enum.js';

describe('AuthService', () => {
  let service: AuthService;
  const alice = { id: 7, role: Role.User };
  const usersService = {
    create: vi.fn(async (email, passwordHash) => ({ id: 1, email, passwordHash })),
    findByEmailWithHash: vi.fn(),
    findById: vi.fn(),
  };
  const refreshTokens = {
    save: vi.fn(),
    delete: vi.fn(),
  };
  const jwt = new JwtService({ secret: 'access-secret', signOptions: { expiresIn: '15m' } });
  const config = { getOrThrow: () => 'refresh-secret' };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: config },
        { provide: getRepositoryToken(RefreshToken), useValue: refreshTokens },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('stores a hash of the password, never the password itself', async () => {
    await service.register({ email: 'a@x.com', password: 'correct horse' });

    const [email, passwordHash] = usersService.create.mock.calls[0];
    expect(email).toBe('a@x.com');
    expect(passwordHash).not.toContain('correct horse');
    expect(await argon2.verify(passwordHash, 'correct horse')).toBe(true);
  });

  describe('validate', () => {
    it('returns the user when the password matches', async () => {
      const passwordHash = await argon2.hash('correct horse');
      usersService.findByEmailWithHash.mockResolvedValue({ id: 1, email: 'a@x.com', passwordHash });
      await expect(service.validate('a@x.com', 'correct horse')).resolves.toMatchObject({ id: 1 });
    });

    it('says "Invalid credentials" for a wrong password and for an unknown email', async () => {
      const passwordHash = await argon2.hash('correct horse');
      usersService.findByEmailWithHash.mockResolvedValueOnce({ id: 1, email: 'a@x.com', passwordHash });
      const wrongPassword = await service.validate('a@x.com', 'wrong').catch((e) => e);
      usersService.findByEmailWithHash.mockResolvedValueOnce(null);
      const unknownEmail = await service.validate('nobody@x.com', 'whatever').catch((e) => e);

      expect(wrongPassword).toBeInstanceOf(UnauthorizedException);
      expect(unknownEmail).toBeInstanceOf(UnauthorizedException);
      expect(wrongPassword.message).toBe('Invalid credentials');
      expect(unknownEmail.message).toBe('Invalid credentials');
    });
  });

  describe('issueTokens', () => {
    it('puts the role in the access token and stores only a hash of the refresh token', async () => {
      const { accessToken, refreshToken } = await service.issueTokens({ id: 7, role: Role.Admin });

      expect(jwt.verify(accessToken)).toMatchObject({ sub: 7, role: Role.Admin });
      expect(jwt.verify(refreshToken, { secret: 'refresh-secret' })).toMatchObject({ sub: 7 });
      const saved = refreshTokens.save.mock.calls[0][0];
      expect(saved.userId).toBe(7);
      expect(saved.tokenHash).not.toBe(refreshToken);
      expect(saved.tokenHash).toHaveLength(64);
    });

    it('gives two logins in the same second different refresh tokens', async () => {
      const first = await service.issueTokens(alice);
      const second = await service.issueTokens(alice);
      expect(first.refreshToken).not.toBe(second.refreshToken);
    });
  });

  describe('refresh', () => {
    it('swaps a stored refresh token for a new pair carrying the current role', async () => {
      const { refreshToken } = await service.issueTokens(alice);
      refreshTokens.delete.mockResolvedValue({ affected: 1 });
      usersService.findById.mockResolvedValue({ id: 7, role: Role.Admin });

      const next = await service.refresh(refreshToken);

      expect(next.refreshToken).not.toBe(refreshToken);
      expect(jwt.verify(next.accessToken)).toMatchObject({ sub: 7, role: Role.Admin });
    });

    it('revokes every session of the user when a retired token is replayed', async () => {
      const { refreshToken } = await service.issueTokens(alice);
      refreshTokens.delete.mockResolvedValueOnce({ affected: 0 });

      await expect(service.refresh(refreshToken)).rejects.toThrow(UnauthorizedException);

      expect(refreshTokens.delete).toHaveBeenLastCalledWith({ userId: 7 });
    });

    it('throws 401 for a missing or forged token without touching the database', async () => {
      await expect(service.refresh(undefined)).rejects.toThrow(UnauthorizedException);
      await expect(service.refresh('not.a.jwt')).rejects.toThrow(UnauthorizedException);
      const forged = await jwt.signAsync({ sub: 7 }, { secret: 'wrong-secret' });
      await expect(service.refresh(forged)).rejects.toThrow(UnauthorizedException);
      expect(refreshTokens.delete).not.toHaveBeenCalled();
    });

    it('throws 401 when the user no longer exists', async () => {
      const { refreshToken } = await service.issueTokens(alice);
      refreshTokens.delete.mockResolvedValue({ affected: 1 });
      usersService.findById.mockResolvedValue(null);
      await expect(service.refresh(refreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  it('revokeAll deletes every refresh token of the user', async () => {
    await service.revokeAll(7);
    expect(refreshTokens.delete).toHaveBeenCalledWith({ userId: 7 });
  });
});

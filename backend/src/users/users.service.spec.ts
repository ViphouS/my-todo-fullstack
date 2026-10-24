import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service.js';
import { User } from './entities/user.entity.js';

describe('UsersService', () => {
  let service: UsersService;
  const repo = {
    existsBy: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn((data) => data),
    save: vi.fn(async (data) => ({ id: 1, ...data })),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: getRepositoryToken(User), useValue: repo }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('saves a new user', async () => {
    repo.existsBy.mockResolvedValue(false);
    const user = await service.create('a@x.com', 'hash');
    expect(user).toMatchObject({ id: 1, email: 'a@x.com', passwordHash: 'hash' });
  });

  it('throws 409 when the email is already registered', async () => {
    repo.existsBy.mockResolvedValue(true);
    await expect(service.create('a@x.com', 'hash')).rejects.toThrow(ConflictException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('throws 409 when the unique index rejects a racing insert', async () => {
    repo.existsBy.mockResolvedValue(false);
    repo.save.mockRejectedValueOnce({ driverError: { code: '23505' } });
    await expect(service.create('a@x.com', 'hash')).rejects.toThrow(ConflictException);
  });

  it('rethrows other database errors', async () => {
    repo.existsBy.mockResolvedValue(false);
    repo.save.mockRejectedValueOnce(new Error('connection lost'));
    await expect(service.create('a@x.com', 'hash')).rejects.toThrow('connection lost');
  });

  it('asks for the hash explicitly when looking a user up for login', async () => {
    await service.findByEmailWithHash('a@x.com');
    expect(repo.findOne.mock.calls[0][0].select).toMatchObject({ passwordHash: true });
  });
});

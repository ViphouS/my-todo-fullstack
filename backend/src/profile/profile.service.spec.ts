import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProfileService } from './profile.service.js';
import { Profile } from './entities/profile.entity.js';
import { UsersService } from '../users/users.service.js';
import { Role } from '../users/role.enum.js';

describe('ProfileService', () => {
  let service: ProfileService;
  const alice = { id: 1, role: Role.User };
  const repo = {
    findOneBy: vi.fn(),
    create: vi.fn((data) => data),
    save: vi.fn(async (data) => ({ id: 1, ...data })),
    merge: vi.fn((target, data) => ({ ...target, ...data })),
  };
  const usersService = { findById: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: getRepositoryToken(Profile), useValue: repo },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('creates a profile from the account email, owned by the user, when none exists', async () => {
    repo.findOneBy.mockResolvedValue(null);
    usersService.findById.mockResolvedValue({ id: 1, email: 'alice@x.com' });
    const profile = await service.find(alice);
    expect(profile).toMatchObject({ ownerId: 1, name: 'alice', email: 'alice@x.com', role: '' });
    expect(repo.findOneBy).toHaveBeenCalledWith({ ownerId: 1 });
  });

  it('throws 404 when the account is gone', async () => {
    repo.findOneBy.mockResolvedValue(null);
    usersService.findById.mockResolvedValue(null);
    await expect(service.find(alice)).rejects.toThrow(NotFoundException);
  });

  it('updates the existing profile', async () => {
    repo.findOneBy.mockResolvedValue({ id: 1, name: 'A', email: 'a@x.com', role: '' });
    const profile = await service.update(alice, { name: 'B' });
    expect(profile).toMatchObject({ id: 1, name: 'B', email: 'a@x.com' });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProfileService } from './profile.service.js';
import { Profile } from './entities/profile.entity.js';

describe('ProfileService', () => {
  let service: ProfileService;
  const repo = {
    findOne: vi.fn(),
    create: vi.fn((data) => data),
    save: vi.fn(async (data) => ({ id: 1, ...data })),
    merge: vi.fn((target, data) => ({ ...target, ...data })),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileService, { provide: getRepositoryToken(Profile), useValue: repo }],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('creates the default profile when none exists', async () => {
    repo.findOne.mockResolvedValue(null);
    const profile = await service.find();
    expect(profile).toMatchObject({ id: 1, role: 'Student' });
  });

  it('updates the existing profile', async () => {
    repo.findOne.mockResolvedValue({ id: 1, name: 'A', email: 'a@x.com', role: '' });
    const profile = await service.update({ name: 'B' });
    expect(profile).toMatchObject({ id: 1, name: 'B', email: 'a@x.com' });
  });
});

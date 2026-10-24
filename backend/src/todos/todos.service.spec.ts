import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TodosService } from './todos.service.js';
import { Todo } from './entities/todo.entity.js';

describe('TodosService', () => {
  let service: TodosService;
  const repo = {
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn((data) => data),
    save: vi.fn(async (data) => ({ id: 1, ...data })),
    merge: vi.fn((target, data) => ({ ...target, ...data })),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [TodosService, { provide: getRepositoryToken(Todo), useValue: repo }],
    }).compile();

    service = module.get<TodosService>(TodosService);
  });

  it('puts new todos above the current first one', async () => {
    repo.findOne.mockResolvedValue({ id: 5, position: 3 });
    const todo = await service.create({ title: 'Buy milk' });
    expect(todo).toMatchObject({ title: 'Buy milk', position: 2 });
  });

  it('throws 404 when the todo does not exist', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(service.update(99, { status: 'DONE' })).rejects.toThrow(NotFoundException);
    await expect(service.remove(99)).rejects.toThrow(NotFoundException);
  });

  it('merges changes into an existing todo', async () => {
    repo.findOneBy.mockResolvedValue({ id: 1, title: 'A', status: 'TODO', starred: false });
    const todo = await service.update(1, { starred: true });
    expect(todo).toMatchObject({ id: 1, title: 'A', starred: true });
  });
});

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TodosService } from './todos.service.js';
import { Todo } from './entities/todo.entity.js';
import { Role } from '../users/role.enum.js';

describe('TodosService', () => {
  let service: TodosService;
  const alice = { id: 1, role: Role.User };
  const admin = { id: 9, role: Role.Admin };
  const repo = {
    find: vi.fn(),
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    findBy: vi.fn(),
    create: vi.fn((data) => data),
    save: vi.fn(async (data) => ({ id: 1, ...data })),
    merge: vi.fn((target, data) => ({ ...target, ...data })),
    remove: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [TodosService, { provide: getRepositoryToken(Todo), useValue: repo }],
    }).compile();

    service = module.get<TodosService>(TodosService);
  });

  it('puts new todos above the owner\'s current first one and sets the owner from the user', async () => {
    repo.findOne.mockResolvedValue({ id: 5, position: 3 });
    const todo = await service.create({ title: 'Buy milk' }, alice);
    expect(todo).toMatchObject({ title: 'Buy milk', position: 2, ownerId: 1 });
    expect(repo.findOne.mock.calls[0][0].where).toEqual({ ownerId: 1 });
  });

  it('lists only the user\'s todos', async () => {
    await service.findAll(alice, { status: 'DONE' });
    expect(repo.find.mock.calls[0][0].where).toMatchObject({ ownerId: 1, status: 'DONE' });
  });

  it('looks a todo up by id and owner, so other people\'s todos are 404', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(service.update(99, { status: 'DONE' }, alice)).rejects.toThrow(NotFoundException);
    await expect(service.remove(99, alice)).rejects.toThrow(NotFoundException);
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: 99, ownerId: 1 });
  });

  it('lets an admin look a todo up by id alone', async () => {
    repo.findOneBy.mockResolvedValue({ id: 7, ownerId: 1 });
    await service.findOne(7, admin);
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: 7 });
  });

  it('merges changes into an existing todo', async () => {
    repo.findOneBy.mockResolvedValue({ id: 1, title: 'A', status: 'TODO', starred: false });
    const todo = await service.update(1, { starred: true }, alice);
    expect(todo).toMatchObject({ id: 1, title: 'A', starred: true });
  });

  it('only bulk-changes and bulk-deletes the user\'s own todos', async () => {
    await service.bulkUpdate({ ids: [1, 2], status: 'DONE' }, alice);
    await service.bulkRemove([1, 2], alice);
    expect(repo.update.mock.calls[0][0]).toMatchObject({ ownerId: 1 });
    expect(repo.delete.mock.calls[0][0]).toMatchObject({ ownerId: 1 });
  });
});

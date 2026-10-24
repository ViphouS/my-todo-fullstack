import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { BulkUpdateTodoDto } from './dto/bulk-todo.dto.js';
import { QueryTodoDto } from './dto/query-todo.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Todo } from './entities/todo.entity.js'
import type { AuthUser } from '../auth/auth-user.js';
import { Role } from '../users/role.enum.js';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private repo: Repository<Todo>,
  ) { }

  findAll(user: AuthUser, query: QueryTodoDto = {}) {
    return this.repo.find({
      where: {
        ownerId: user.id,
        ...(query.status && { status: query.status }),
        ...(query.q && { title: ILike(`%${query.q}%`) }),
      },
      order: { position: "ASC", id: "ASC" },
    });
  }

  async findOne(id: number, user: AuthUser) {
    const todo = await this.repo.findOneBy(user.role === Role.Admin ? { id } : { id, ownerId: user.id });
    if (!todo) throw new NotFoundException(`Todo #${id} not found`);
    return todo;
  }

  async create(dto: CreateTodoDto, user: AuthUser) {
    // New todos go to the top of the list
    const first = await this.repo.findOne({ where: { ownerId: user.id }, order: { position: "ASC" } });
    const todo = this.repo.create({ ...dto, ownerId: user.id });
    todo.position = first ? first.position - 1 : 0;
    return this.repo.save(todo);
  }

  async update(id: number, dto: UpdateTodoDto, user: AuthUser) {
    const todo = await this.findOne(id, user);
    return this.repo.save(this.repo.merge(todo, dto));
  }

  async remove(id: number, user: AuthUser) {
    const todo = await this.findOne(id, user);
    await this.repo.remove(todo);
  }

  async bulkUpdate({ ids, ...changes }: BulkUpdateTodoDto, user: AuthUser) {
    await this.repo.update({ id: In(ids), ownerId: user.id }, changes);
    return this.repo.findBy({ id: In(ids), ownerId: user.id });
  }

  async bulkRemove(ids: number[], user: AuthUser) {
    await this.repo.delete({ id: In(ids), ownerId: user.id });
  }

  async reorder(ids: number[], user: AuthUser) {
    await this.repo.manager.transaction(async (manager) => {
      for (const [position, id] of ids.entries()) {
        await manager.update(Todo, { id, ownerId: user.id }, { position });
      }
    });
    return this.findAll(user);
  }
}

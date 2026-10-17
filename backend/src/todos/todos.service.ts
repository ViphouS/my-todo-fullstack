import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { BulkUpdateTodoDto } from './dto/bulk-todo.dto.js';
import { QueryTodoDto } from './dto/query-todo.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Todo } from './entities/todo.entity.js'

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private repo: Repository<Todo>,
  ) { }

  findAll(query: QueryTodoDto = {}) {
    return this.repo.find({
      where: {
        ...(query.status && { status: query.status }),
        ...(query.q && { title: ILike(`%${query.q}%`) }),
      },
      order: { position: "ASC", id: "ASC" },
    });
  }

  async findOne(id: number) {
    const todo = await this.repo.findOneBy({ id });
    if (!todo) throw new NotFoundException(`Todo #${id} not found`);
    return todo;
  }

  async create(dto: CreateTodoDto) {
    // New todos go to the top of the list
    const first = await this.repo.findOne({ where: {}, order: { position: "ASC" } });
    const todo = this.repo.create(dto);
    todo.position = first ? first.position - 1 : 0;
    return this.repo.save(todo);
  }

  async update(id: number, dto: UpdateTodoDto) {
    const todo = await this.findOne(id);
    return this.repo.save(this.repo.merge(todo, dto));
  }

  async remove(id: number) {
    const todo = await this.findOne(id);
    await this.repo.remove(todo);
  }

  async bulkUpdate({ ids, ...changes }: BulkUpdateTodoDto) {
    await this.repo.update({ id: In(ids) }, changes);
    return this.repo.findBy({ id: In(ids) });
  }

  async bulkRemove(ids: number[]) {
    await this.repo.delete({ id: In(ids) });
  }

  async reorder(ids: number[]) {
    await this.repo.manager.transaction(async (manager) => {
      for (const [position, id] of ids.entries()) {
        await manager.update(Todo, { id }, { position });
      }
    });
    return this.findAll();
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, ParseIntPipe, Query } from '@nestjs/common';
import { TodosService } from './todos.service.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { BulkUpdateTodoDto, TodoIdsDto } from './dto/bulk-todo.dto.js';
import { QueryTodoDto } from './dto/query-todo.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/auth-user.js';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto, @CurrentUser() user: AuthUser) {
    return this.todosService.create(createTodoDto, user);
  }

  @Get()
  findAll(@Query() query: QueryTodoDto, @CurrentUser() user: AuthUser) {
    return this.todosService.findAll(user, query);
  }

  // Static routes must come before ':id', or "bulk" would be parsed as an id
  @Patch('bulk')
  bulkUpdate(@Body() dto: BulkUpdateTodoDto, @CurrentUser() user: AuthUser) {
    return this.todosService.bulkUpdate(dto, user);
  }

  @Delete('bulk')
  @HttpCode(204)
  bulkRemove(@Body() dto: TodoIdsDto, @CurrentUser() user: AuthUser) {
    return this.todosService.bulkRemove(dto.ids, user);
  }

  @Patch('order')
  reorder(@Body() dto: TodoIdsDto, @CurrentUser() user: AuthUser) {
    return this.todosService.reorder(dto.ids, user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.todosService.findOne(id, user);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTodoDto: UpdateTodoDto, @CurrentUser() user: AuthUser) {
    return this.todosService.update(id, updateTodoDto, user);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.todosService.remove(id, user);
  }
}

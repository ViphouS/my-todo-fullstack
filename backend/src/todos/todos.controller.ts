import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, ParseIntPipe, Query } from '@nestjs/common';
import { TodosService } from './todos.service.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { BulkUpdateTodoDto, TodoIdsDto } from './dto/bulk-todo.dto.js';
import { QueryTodoDto } from './dto/query-todo.dto.js';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todosService.create(createTodoDto);
  }

  @Get()
  findAll(@Query() query: QueryTodoDto) {
    return this.todosService.findAll(query);
  }

  // Static routes must come before ':id', or "bulk" would be parsed as an id
  @Patch('bulk')
  bulkUpdate(@Body() dto: BulkUpdateTodoDto) {
    return this.todosService.bulkUpdate(dto);
  }

  @Delete('bulk')
  @HttpCode(204)
  bulkRemove(@Body() dto: TodoIdsDto) {
    return this.todosService.bulkRemove(dto.ids);
  }

  @Patch('order')
  reorder(@Body() dto: TodoIdsDto) {
    return this.todosService.reorder(dto.ids);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.todosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(id, updateTodoDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.todosService.remove(id);
  }
}

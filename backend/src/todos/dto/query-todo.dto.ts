import { IsIn, IsOptional, IsString } from 'class-validator';
import { STATUSES } from './create-todo.dto.js';

export class QueryTodoDto {
  @IsOptional()
  @IsIn(STATUSES)
  status?: string;
  @IsOptional()
  @IsString()
  q?: string;
}

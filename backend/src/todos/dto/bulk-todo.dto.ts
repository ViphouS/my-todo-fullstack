import { ArrayNotEmpty, IsArray, IsIn, IsInt, IsOptional } from 'class-validator';
import { STATUSES } from './create-todo.dto.js';

export class TodoIdsDto {
  @IsArray() @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[];
}

export class BulkUpdateTodoDto extends TodoIdsDto {
  @IsOptional()
  @IsIn(STATUSES)
  status?: string;
}

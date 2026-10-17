import { IsString, IsNotEmpty, MaxLength, IsOptional, IsIn, IsBoolean } from 'class-validator';

export const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

export class CreateTodoDto {
  @IsString() @IsNotEmpty()
  @MaxLength(200)
  title: string;
  @IsOptional()
  @IsIn(STATUSES)
  status?: string;
  @IsOptional()
  @IsBoolean()
  starred?: boolean;
}

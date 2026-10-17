import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class CreateProfileDto {
  @IsString() @IsNotEmpty()
  @MaxLength(100)
  name: string;
  // Email is optional in the UI, so an empty string is allowed
  @ValidateIf((o) => o.email !== '')
  @IsEmail()
  @MaxLength(200)
  email: string;
  @IsOptional()
  @IsString()
  @MaxLength(100)
  role?: string;
}

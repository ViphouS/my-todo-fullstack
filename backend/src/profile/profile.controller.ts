import { Controller, Get, Body, Patch } from '@nestjs/common';
import { ProfileService } from './profile.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/auth-user.js';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  find(@CurrentUser() user: AuthUser) {
    return this.profileService.find(user);
  }

  @Patch()
  update(@CurrentUser() user: AuthUser, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(user, updateProfileDto);
  }
}

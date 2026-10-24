import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity.js';
import type { AuthUser } from '../auth/auth-user.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private repo: Repository<Profile>,
    private usersService: UsersService,
  ) { }

  async find(user: AuthUser) {
    const profile = await this.repo.findOneBy({ ownerId: user.id });
    if (profile) return profile;
    const account = await this.usersService.findById(user.id);
    if (!account) throw new NotFoundException();
    const name = account.email.split('@')[0];
    return this.repo.save(this.repo.create({ name, email: account.email, role: '', ownerId: user.id }));
  }

  async update(user: AuthUser, dto: UpdateProfileDto) {
    const profile = await this.find(user);
    return this.repo.save(this.repo.merge(profile, dto));
  }
}

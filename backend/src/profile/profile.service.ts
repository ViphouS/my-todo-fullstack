import { Injectable } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity.js';

// The app has one user, so the profile is a single row
const DEFAULT_PROFILE = {
  name: 'Viphou Sarun',
  email: 'viphou@example.com',
  role: 'Student',
};

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private repo: Repository<Profile>,
  ) { }

  async find() {
    const profile = await this.repo.findOne({ where: {}, order: { id: "ASC" } });
    return profile ?? this.repo.save(this.repo.create(DEFAULT_PROFILE));
  }

  async update(dto: UpdateProfileDto) {
    const profile = await this.find();
    return this.repo.save(this.repo.merge(profile, dto));
  }
}

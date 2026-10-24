import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';

const UNIQUE_VIOLATION = '23505';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) { }

  findById(id: number) {
    return this.repo.findOneBy({ id });
  }

  findByEmailWithHash(email: string) {
    return this.repo.findOne({
      where: { email },
      select: { id: true, email: true, role: true, passwordHash: true },
    });
  }

  async create(email: string, passwordHash: string) {
    if (await this.repo.existsBy({ email })) throw new ConflictException('Email already registered');
    try {
      return await this.repo.save(this.repo.create({ email, passwordHash }));
    } catch (error: any) {
      if (error?.driverError?.code === UNIQUE_VIOLATION || error?.code === UNIQUE_VIOLATION) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }
}

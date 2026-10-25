import { Exclude } from 'class-transformer';
import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../role.enum.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200, unique: true })
  email: string;

  @Exclude()
  @Column({ length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;
}

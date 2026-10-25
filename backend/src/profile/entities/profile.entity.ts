import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ length: 100 })
  name: string;
  @Column({ length: 200 })
  email: string;
  @Column({ length: 100, default: "" })
  role: string;
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  owner: User;
  @Column()
  ownerId: number;
}

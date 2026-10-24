import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ length: 200 })
  title: string;
  @Column({ default: "TODO" })
  status: string;
  @Column({ default: false })
  starred: boolean;
  // Drag-and-drop order; lower comes first
  @Column({ default: 0 })
  position: number;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  owner: User;
  @Column()
  ownerId: number;
}

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}

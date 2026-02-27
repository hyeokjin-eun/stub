import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('search_history')
export class SearchHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  user_id: number;

  @Column({ type: 'varchar', length: 200 })
  query: string;

  @CreateDateColumn()
  @Index()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.search_history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

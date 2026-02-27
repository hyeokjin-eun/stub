import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Collection } from './collection.entity';

@Entity('collection_comments')
export class CollectionComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  collection_id: number;

  @Column()
  user_id: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Collection, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Collection } from './collection.entity';

@Entity('collection_likes')
@Unique(['user_id', 'collection_id'])
export class CollectionLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  user_id: number;

  @Column()
  @Index()
  collection_id: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Collection, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;
}

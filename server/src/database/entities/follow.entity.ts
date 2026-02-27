import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
  Check,
} from 'typeorm';
import { User } from './user.entity';

@Entity('follows')
@Unique(['follower_id', 'following_id'])
@Check('"follower_id" != "following_id"')
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  follower_id: number; // 팔로우 하는 사람

  @Column()
  @Index()
  following_id: number; // 팔로우 받는 사람

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.following, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower: User;

  @ManyToOne(() => User, (user) => user.followers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'following_id' })
  following: User;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_achievements')
@Unique(['user_id', 'achievement_code'])
export class UserAchievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  user_id: number;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  achievement_code: string; // 코드에 정의된 업적 키

  @CreateDateColumn()
  achieved_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.achievements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  LIKE_COLLECTION = 'LIKE_COLLECTION',
  LIKE_TICKET     = 'LIKE_TICKET',
  FOLLOW          = 'FOLLOW',
  COMMENT         = 'COMMENT',
  MENTION         = 'MENTION',
  SYSTEM          = 'SYSTEM',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  user_id: number;           // 수신자

  @Column({ nullable: true })
  actor_id: number | null;   // 발신자 (SYSTEM이면 null)

  @Column({ type: 'varchar' })
  type: NotificationType;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true })
  target_url: string | null; // 클릭 시 이동할 경로

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_id' })
  actor: User;
}

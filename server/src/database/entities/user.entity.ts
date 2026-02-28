import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  Unique,
} from 'typeorm';
import { CatalogItem } from './catalog-item.entity';
import { CatalogGroup } from './catalog-group.entity';
import { Collection } from './collection.entity';
import { Like } from './like.entity';
import { Follow } from './follow.entity';
import { UserAchievement } from './user-achievement.entity';
import { SearchHistory } from './search-history.entity';
import { Stub } from './stub.entity';

@Entity('users')
@Unique(['oauth_provider', 'oauth_id'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // 인증 정보
  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password_hash: string;

  // 프로필
  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  nickname: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar_url: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  birth_date: Date;

  @Column({ type: 'boolean', default: false })
  onboarding_completed: boolean;

  @Column({ type: 'varchar', length: 20, default: 'USER' })
  role: 'USER' | 'ADMIN';

  // OAuth 지원
  @Column({ type: 'varchar', length: 50, nullable: true })
  oauth_provider: string; // 'google', 'kakao', 'naver'

  @Column({ type: 'varchar', length: 255, nullable: true })
  oauth_id: string;

  // 타임스탬프
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => CatalogItem, (item) => item.owner)
  catalog_items: CatalogItem[];

  @OneToMany(() => CatalogGroup, (group) => group.creator)
  catalog_groups: CatalogGroup[];

  @OneToMany(() => Collection, (collection) => collection.user)
  collections: Collection[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following)
  followers: Follow[];

  @OneToMany(() => UserAchievement, (achievement) => achievement.user)
  achievements: UserAchievement[];

  @OneToMany(() => SearchHistory, (history) => history.user)
  search_history: SearchHistory[];

  @OneToMany(() => Stub, (stub) => stub.user)
  stubs: Stub[];
}

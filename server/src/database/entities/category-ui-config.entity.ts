import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Category } from './category.entity';

/**
 * 카테고리 UI/UX 설정 엔티티
 * 카테고리별로 화면 동작을 플래그로 조절
 */
@Entity('category_ui_configs')
export class CategoryUiConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  category_id: number;

  // 기본값으로 자동 선택 (같은 depth에서 하나만 true 권장)
  @Column({ type: 'boolean', default: false })
  is_default: boolean;

  // UI 단계 건너뛰기 (자동 선택 + 필터 안 보임)
  @Column({ type: 'boolean', default: false })
  skip_ui: boolean;

  // 자동으로 하위 카테고리 펼침
  @Column({ type: 'boolean', default: false })
  auto_expand: boolean;

  // 필터에 표시 여부
  @Column({ type: 'boolean', default: true })
  show_in_filter: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => Category, (category) => category.ui_config)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}

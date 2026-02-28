import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Item Type UI/UX 설정 엔티티
 * 아이템 타입별로 탭 표시 및 동작을 플래그로 조절
 */
@Entity('item_type_ui_configs')
export class ItemTypeUiConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 30 })
  @Index()
  item_type: string; // 'TICKET' | 'VIEWING' | 'TRADING_CARD' | 'GOODS'

  // 기본값으로 자동 선택 (하나만 true 권장)
  @Column({ type: 'boolean', default: false })
  is_default: boolean;

  // UI 탭 건너뛰기 (자동 선택 + 탭 안 보임)
  @Column({ type: 'boolean', default: false })
  skip_ui: boolean;

  // 탭에 표시 여부
  @Column({ type: 'boolean', default: true })
  show_in_tab: boolean;

  // 탭 표시 순서
  @Column({ type: 'integer', default: 0 })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

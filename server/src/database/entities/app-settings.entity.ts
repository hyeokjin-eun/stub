import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 앱 전역 설정 엔티티
 * 앱 타이틀, 메타 정보 등을 관리
 */
@Entity('app_settings')
export class AppSettings {
  @PrimaryGeneratedColumn()
  id: number;

  // 앱 타이틀 (기본값: STUB)
  @Column({ type: 'varchar', length: 50, default: 'STUB' })
  app_title: string;

  // 앱 서브타이틀 (선택)
  @Column({ type: 'varchar', length: 100, nullable: true })
  app_subtitle: string;

  // 메타 설명
  @Column({ type: 'text', nullable: true })
  app_description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

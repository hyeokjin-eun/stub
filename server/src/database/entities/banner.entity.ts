import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  subtitle: string;

  @Column({ type: 'text', nullable: true })
  tag: string;

  @Column({ type: 'text' })
  image_url: string;

  @Column({ type: 'text', nullable: true })
  link_url: string;

  @Column({ type: 'text', default: '#1a0030' })
  background_color: string;

  @Column({ type: 'integer', default: 0 })
  order_index: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'datetime', nullable: true })
  start_date: Date;

  @Column({ type: 'datetime', nullable: true })
  end_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

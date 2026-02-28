export type ItemType = 'TICKET' | 'VIEWING' | 'TRADING_CARD' | 'GOODS';

// TICKET status
export type TicketStatus = 'collected' | 'wish' | 'trading';
// VIEWING status
export type ViewingStatus = 'watched' | 'watching' | 'plan';
// 공통 (타입 좁히기 전 사용)
export type ItemStatus = TicketStatus | ViewingStatus;

export class CreateCatalogItemDto {
  title: string;
  description?: string;

  item_type: ItemType; // 'TICKET' | 'VIEWING' | 'TRADING_CARD' | 'GOODS'
  category_id: number; // 소분류(depth=2) category id
  catalog_group_id?: number;

  status?: ItemStatus;
  image_url?: string;
  thumbnail_url?: string;
  color?: string;
  icon?: string;
  is_public?: boolean;
  sort_order?: number;

  // 타입별 메타데이터
  // TICKET:       { type, variant, numbering, seat, performance_date, venue }
  // VIEWING:      { type, episode, runtime, watched_at, rating, platform, rewatch_count }
  // TRADING_CARD: { type, card_number, rarity, set, grade, graded }
  // GOODS:        { type, goods_type, artist, member, edition, release_date }
  metadata: {
    type: ItemType;
    [key: string]: any;
  };
}

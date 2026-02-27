export class CreateCatalogItemDto {
  title: string;
  description?: string;
  category_id: number;
  catalog_group_id?: number;
  status?: string; // 'collected', 'wish', 'trading'
  image_url?: string;
  thumbnail_url?: string;
  color?: string;
  icon?: string;
  is_public?: boolean;

  // 메타데이터 (타입별 상세 정보)
  metadata: {
    type: string; // 'ticket', 'card', 'goods'
    [key: string]: any;
  };
}

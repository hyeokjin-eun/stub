export class UpdateCatalogItemDto {
  title?: string;
  description?: string;
  catalog_group_id?: number;
  status?: string;
  image_url?: string;
  thumbnail_url?: string;
  color?: string;
  icon?: string;
  is_public?: boolean;

  // 메타데이터
  metadata?: {
    type?: string;
    [key: string]: any;
  };
}

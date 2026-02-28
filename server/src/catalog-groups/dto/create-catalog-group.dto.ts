export class CreateCatalogGroupDto {
  name: string;
  description?: string;
  category_id: number; // 소분류(depth=2) category id
  color?: string;
  icon?: string;
  thumbnail_url?: string;
  is_public?: boolean;
}

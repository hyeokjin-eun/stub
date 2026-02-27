export class CreateCatalogGroupDto {
  name: string;
  description?: string;
  category_id: number;
  parent_group_id?: number;
  color: string;
  icon: string;
  thumbnail_url?: string;
  is_public?: boolean;
}

import { ItemStatus } from './create-catalog-item.dto';

export class UpdateCatalogItemDto {
  title?: string;
  description?: string;
  catalog_group_id?: number;
  status?: ItemStatus;
  image_url?: string;
  thumbnail_url?: string;
  color?: string;
  icon?: string;
  is_public?: boolean;
  sort_order?: number;

  metadata?: {
    [key: string]: any;
  };
}

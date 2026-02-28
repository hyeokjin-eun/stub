import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CatalogItem,
  // CatalogItemMetadata,
  Category,
  CatalogGroup,
  User,
} from '../database/entities';
import { CatalogItemsService } from './catalog-items.service';
import { CatalogItemsController } from './catalog-items.controller';
import { AdminGuard } from '../auth/guards/admin.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CatalogItem,
      // CatalogItemMetadata,
      Category,
      CatalogGroup,
      User,
    ]),
  ],
  controllers: [CatalogItemsController],
  providers: [CatalogItemsService, AdminGuard],
  exports: [CatalogItemsService],
})
export class CatalogItemsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CatalogItem,
  CatalogItemMetadata,
  Category,
  CatalogGroup,
} from '../database/entities';
import { CatalogItemsService } from './catalog-items.service';
import { CatalogItemsController } from './catalog-items.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CatalogItem,
      CatalogItemMetadata,
      Category,
      CatalogGroup,
    ]),
  ],
  controllers: [CatalogItemsController],
  providers: [CatalogItemsService],
  exports: [CatalogItemsService],
})
export class CatalogItemsModule {}

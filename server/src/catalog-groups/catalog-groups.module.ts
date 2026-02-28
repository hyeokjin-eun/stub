import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogGroup, Category } from '../database/entities';
import { CatalogGroupsService } from './catalog-groups.service';
import { CatalogGroupsController } from './catalog-groups.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CatalogGroup, Category])],
  controllers: [CatalogGroupsController],
  providers: [CatalogGroupsService],
  exports: [CatalogGroupsService],
})
export class CatalogGroupsModule {}

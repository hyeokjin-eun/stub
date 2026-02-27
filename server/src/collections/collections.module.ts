import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { Collection } from '../database/entities/collection.entity';
import { CollectionItem } from '../database/entities/collection-item.entity';
import { CollectionLike } from '../database/entities/collection-like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, CollectionItem, CollectionLike])],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionLike } from '../database/entities/collection-like.entity';
import { Collection } from '../database/entities/collection.entity';
import { User } from '../database/entities';
import { CollectionLikesService } from './collection-likes.service';
import { CollectionLikesController } from './collection-likes.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([CollectionLike, Collection, User]), NotificationsModule],
  controllers: [CollectionLikesController],
  providers: [CollectionLikesService],
  exports: [CollectionLikesService],
})
export class CollectionLikesModule {}

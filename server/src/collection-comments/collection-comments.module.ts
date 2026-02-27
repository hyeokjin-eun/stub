import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionCommentsService } from './collection-comments.service';
import { CollectionCommentsController } from './collection-comments.controller';
import { CollectionComment } from '../database/entities/collection-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CollectionComment])],
  controllers: [CollectionCommentsController],
  providers: [CollectionCommentsService],
  exports: [CollectionCommentsService],
})
export class CollectionCommentsModule {}

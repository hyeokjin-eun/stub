import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like, CatalogItem } from '../database/entities';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Like, CatalogItem])],
  controllers: [LikesController],
  providers: [LikesService],
  exports: [LikesService],
})
export class LikesModule {}

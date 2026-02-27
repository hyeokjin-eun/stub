import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { CollectionCommentsService } from './collection-comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('collection-comments')
@UseGuards(JwtAuthGuard)
export class CollectionCommentsController {
  constructor(private readonly service: CollectionCommentsService) {}

  @Get('collection/:collectionId')
  findByCollection(@Param('collectionId', ParseIntPipe) collectionId: number) {
    return this.service.findByCollection(collectionId);
  }

  @Post()
  create(@Request() req, @Body() body: { collection_id: number; content: string }) {
    return this.service.create(body.collection_id, req.user.id, body.content);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.service.remove(id, req.user.id);
  }
}

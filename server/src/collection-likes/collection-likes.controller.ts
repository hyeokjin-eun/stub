import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CollectionLikesService } from './collection-likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('collection-likes')
export class CollectionLikesController {
  constructor(private readonly service: CollectionLikesService) {}

  /** POST /collection-likes/toggle/:collectionId */
  @UseGuards(JwtAuthGuard)
  @Post('toggle/:collectionId')
  toggle(
    @Request() req,
    @Param('collectionId', ParseIntPipe) collectionId: number,
  ) {
    return this.service.toggle(req.user.id, collectionId);
  }

  /** GET /collection-likes/status/:collectionId */
  @UseGuards(JwtAuthGuard)
  @Get('status/:collectionId')
  getStatus(
    @Request() req,
    @Param('collectionId', ParseIntPipe) collectionId: number,
  ) {
    return this.service.getStatus(req.user.id, collectionId);
  }
}

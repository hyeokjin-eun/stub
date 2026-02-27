import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('toggle/:itemId')
  toggle(@Request() req, @Param('itemId', ParseIntPipe) itemId: number) {
    return this.likesService.toggle(req.user.id, itemId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getUserLikes(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.likesService.getUserLikes(
      req.user.id,
      parseInt(page),
      parseInt(limit),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('check/:itemId')
  checkLiked(@Request() req, @Param('itemId', ParseIntPipe) itemId: number) {
    return this.likesService.checkLiked(req.user.id, itemId);
  }
}

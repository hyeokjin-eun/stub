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
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('toggle/:userId')
  toggle(@Request() req, @Param('userId', ParseIntPipe) userId: number) {
    return this.followsService.toggle(req.user.id, userId);
  }

  @Get('followers/:userId')
  getFollowers(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.followsService.getFollowers(
      userId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('following/:userId')
  getFollowing(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.followsService.getFollowing(
      userId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('check/:userId')
  checkFollowing(
    @Request() req,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.followsService.checkFollowing(req.user.id, userId);
  }
}

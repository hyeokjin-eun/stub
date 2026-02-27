import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    return this.usersService.findAll(page, limit);
  }

  @Get('count')
  count() {
    return this.usersService.count();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    // 본인만 수정 가능
    if (req.user.id !== id) {
      throw new ForbiddenException('본인의 프로필만 수정할 수 있습니다');
    }

    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    // 본인만 삭제 가능
    if (req.user.id !== id) {
      throw new ForbiddenException('본인의 계정만 삭제할 수 있습니다');
    }

    return this.usersService.remove(id);
  }

  @Get(':id/stats')
  getUserStats(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserStats(id);
  }
}

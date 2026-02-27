import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { StubsService } from './stubs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stubs')
@UseGuards(JwtAuthGuard)
export class StubsController {
  constructor(private readonly stubsService: StubsService) {}

  // GET /stubs/me - 내 스텁 목록 (마이페이지)
  @Get('me')
  getMyStubs(@Request() req) {
    return this.stubsService.findByUser(req.user.id);
  }

  // GET /stubs/me/catalog-item/:catalogItemId - 특정 카탈로그 아이템 보유 여부
  @Get('me/catalog-item/:catalogItemId')
  getMyStubByCatalogItem(
    @Request() req,
    @Param('catalogItemId', ParseIntPipe) catalogItemId: number,
  ) {
    return this.stubsService.findByUserAndCatalogItem(req.user.id, catalogItemId);
  }

  // GET /stubs/me/group/:groupId - 그룹 기준 보유 맵 (카탈로그 탭 보유 뱃지용)
  @Get('me/group/:groupId')
  getMyOwnedMapByGroup(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.stubsService.getOwnedMapByGroup(req.user.id, groupId);
  }

  // POST /stubs - 스텁 등록 (보유 등록)
  @Post()
  createStub(
    @Request() req,
    @Body()
    body: {
      catalog_item_id?: number;
      image_url?: string;
      status?: string;
      condition?: string;
      notes?: string;
      acquired_at?: Date;
    },
  ) {
    return this.stubsService.create(req.user.id, body);
  }

  // PATCH /stubs/:id - 스텁 수정
  @Patch(':id')
  updateStub(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      image_url?: string;
      status?: string;
      condition?: string;
      notes?: string;
      acquired_at?: Date;
    },
  ) {
    return this.stubsService.update(id, req.user.id, body);
  }

  // DELETE /stubs/:id - 스텁 삭제 (보유 해제)
  @Delete(':id')
  removeStub(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.stubsService.remove(id, req.user.id);
  }
}

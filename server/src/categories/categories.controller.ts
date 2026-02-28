import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService, ItemType } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * GET /categories/tree?item_type=TICKET
   * item_type별 전체 트리 (대분류 → 중분류 → 소분류 중첩)
   */
  @Get('tree')
  findTree(@Query('item_type') itemType?: ItemType) {
    return this.categoriesService.findTree(itemType);
  }

  /**
   * GET /categories/roots?item_type=VIEWING
   * 대분류 목록만 flat하게 반환
   */
  @Get('roots')
  findRoots(@Query('item_type') itemType?: ItemType) {
    return this.categoriesService.findRoots(itemType);
  }

  /**
   * GET /categories/:id/children
   * 특정 카테고리의 자식 목록 (중분류 or 소분류)
   */
  @Get(':id/children')
  findChildren(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findChildren(id);
  }

  /**
   * GET /categories/:id/breadcrumb
   * 소분류 → 중분류 → 대분류 경로 반환
   */
  @Get(':id/breadcrumb')
  findBreadcrumb(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findBreadcrumb(id);
  }

  /**
   * GET /categories/code/:code
   */
  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.categoriesService.findByCode(code);
  }

  /**
   * GET /categories/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  // ----------------------------------------------------------------
  // CategoryUiConfig API (어드민 전용)
  // ----------------------------------------------------------------

  /**
   * GET /categories/ui-configs/all
   * 모든 카테고리의 UI 설정 조회 (어드민)
   */
  @Get('ui-configs/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAllUiConfigs() {
    return this.categoriesService.findAllUiConfigs();
  }

  /**
   * GET /categories/:categoryId/ui-config
   * 특정 카테고리의 UI 설정 조회
   */
  @Get(':categoryId/ui-config')
  findUiConfig(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.categoriesService.findUiConfig(categoryId);
  }

  /**
   * PUT /categories/:categoryId/ui-config
   * UI 설정 생성/업데이트 (어드민)
   */
  @Put(':categoryId/ui-config')
  @UseGuards(JwtAuthGuard, AdminGuard)
  upsertUiConfig(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() body: {
      is_default?: boolean;
      skip_ui?: boolean;
      auto_expand?: boolean;
      show_in_filter?: boolean;
    },
  ) {
    return this.categoriesService.upsertUiConfig(categoryId, body);
  }

  /**
   * DELETE /categories/:categoryId/ui-config
   * UI 설정 삭제 (기본값으로 복원, 어드민)
   */
  @Delete(':categoryId/ui-config')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteUiConfig(@Param('categoryId', ParseIntPipe) categoryId: number) {
    await this.categoriesService.deleteUiConfig(categoryId);
    return { message: 'UI 설정이 삭제되었습니다' };
  }

  // ----------------------------------------------------------------
  // ItemTypeUiConfig API (어드민 전용)
  // ----------------------------------------------------------------

  /**
   * GET /categories/item-types/configs
   * 모든 ItemType 설정 조회
   */
  @Get('item-types/configs')
  findAllItemTypeConfigs() {
    return this.categoriesService.findAllItemTypeConfigs();
  }

  /**
   * GET /categories/item-types/:itemType/config
   * 특정 ItemType 설정 조회
   */
  @Get('item-types/:itemType/config')
  findItemTypeConfig(@Param('itemType') itemType: string) {
    return this.categoriesService.findItemTypeConfig(itemType);
  }

  /**
   * PUT /categories/item-types/:itemType/config
   * ItemType 설정 업데이트 (어드민)
   */
  @Put('item-types/:itemType/config')
  @UseGuards(JwtAuthGuard, AdminGuard)
  upsertItemTypeConfig(
    @Param('itemType') itemType: string,
    @Body() body: {
      is_default?: boolean;
      skip_ui?: boolean;
      show_in_tab?: boolean;
      sort_order?: number;
    },
  ) {
    return this.categoriesService.upsertItemTypeConfig(itemType, body);
  }

  /**
   * DELETE /categories/item-types/:itemType/config
   * ItemType 설정 삭제 (기본값으로 복원, 어드민)
   */
  @Delete('item-types/:itemType/config')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteItemTypeConfig(@Param('itemType') itemType: string) {
    await this.categoriesService.deleteItemTypeConfig(itemType);
    return { message: 'ItemType 설정이 삭제되었습니다' };
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CatalogItemsService } from './catalog-items.service';
import { CreateCatalogItemDto, ItemType } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('catalog-items')
export class CatalogItemsController {
  constructor(private readonly catalogItemsService: CatalogItemsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createDto: CreateCatalogItemDto) {
    return this.catalogItemsService.create(req.user.id, createDto);
  }

  /**
   * GET /catalog-items
   * ?page=1&limit=20
   * ?category_id=33         ← 소분류 id
   * ?catalog_group_id=1
   * ?owner_id=1
   * ?item_type=VIEWING
   * ?status=watched
   */
  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('category_id') categoryId?: string,
    @Query('catalog_group_id') groupId?: string,
    @Query('owner_id') ownerId?: string,
    @Query('item_type') itemType?: ItemType,
    @Query('status') status?: string,
  ) {
    return this.catalogItemsService.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      catalogGroupId: groupId ? parseInt(groupId) : undefined,
      ownerId: ownerId ? parseInt(ownerId) : undefined,
      itemType,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.catalogItemsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() updateDto: UpdateCatalogItemDto,
  ) {
    return this.catalogItemsService.update(id, req.user.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.catalogItemsService.remove(id, req.user.id);
  }

  // ── Admin endpoints (owner 체크 bypass) ──────────────────────────

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/:id')
  adminUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCatalogItemDto,
  ) {
    return this.catalogItemsService.adminUpdate(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/:id')
  adminRemove(@Param('id', ParseIntPipe) id: number) {
    return this.catalogItemsService.adminRemove(id);
  }
}

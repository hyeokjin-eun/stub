import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CatalogGroupsService } from './catalog-groups.service';
import { CreateCatalogGroupDto } from './dto/create-catalog-group.dto';
import { UpdateCatalogGroupDto } from './dto/update-catalog-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ItemType } from '../categories/categories.service';

@Controller('catalog-groups')
export class CatalogGroupsController {
  constructor(private readonly catalogGroupsService: CatalogGroupsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createDto: CreateCatalogGroupDto) {
    return this.catalogGroupsService.create(req.user.id, createDto);
  }

  /**
   * GET /catalog-groups
   * ?page=1&limit=20
   * ?category_id=33        ← 소분류 id
   * ?item_type=TICKET      ← 수집 타입 필터
   * ?is_official=true
   */
  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('category_id') categoryId?: string,
    @Query('item_type') itemType?: ItemType,
    @Query('is_official') isOfficial?: string,
  ) {
    return this.catalogGroupsService.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      itemType,
      isOfficial: isOfficial !== undefined ? isOfficial === 'true' : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.catalogGroupsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() updateDto: UpdateCatalogGroupDto,
  ) {
    return this.catalogGroupsService.update(id, req.user.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.catalogGroupsService.remove(id, req.user.id);
  }
}

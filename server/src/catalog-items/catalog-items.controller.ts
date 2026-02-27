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
import { CatalogItemsService } from './catalog-items.service';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('catalog-items')
export class CatalogItemsController {
  constructor(private readonly catalogItemsService: CatalogItemsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createDto: CreateCatalogItemDto) {
    return this.catalogItemsService.create(req.user.id, createDto);
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('category_id') categoryId?: string,
    @Query('catalog_group_id') groupId?: string,
    @Query('owner_id') ownerId?: string,
    @Query('status') status?: string,
  ) {
    const filters: any = {};
    if (categoryId) filters.category_id = parseInt(categoryId);
    if (groupId) filters.catalog_group_id = parseInt(groupId);
    if (ownerId) filters.owner_id = parseInt(ownerId);
    if (status) filters.status = status;

    return this.catalogItemsService.findAll(
      parseInt(page),
      parseInt(limit),
      filters,
    );
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
}

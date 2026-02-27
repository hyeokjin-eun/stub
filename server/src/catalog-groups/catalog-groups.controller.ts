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

@Controller('catalog-groups')
export class CatalogGroupsController {
  constructor(private readonly catalogGroupsService: CatalogGroupsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createDto: CreateCatalogGroupDto) {
    return this.catalogGroupsService.create(req.user.id, createDto);
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('category_id') categoryId?: string,
    @Query('parent_group_id') parentGroupId?: string,
  ) {
    // parent_group_id=0 이면 최상위(null)만 조회
    const parsedParent =
      parentGroupId === '0' ? null :
      parentGroupId !== undefined ? parseInt(parentGroupId) : undefined;

    return this.catalogGroupsService.findAll(
      parseInt(page),
      parseInt(limit),
      categoryId ? parseInt(categoryId) : undefined,
      parsedParent,
    );
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

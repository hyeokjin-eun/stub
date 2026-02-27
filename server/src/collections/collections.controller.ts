import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('collections')
@UseGuards(JwtAuthGuard)
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get('me')
  findMine(@Request() req) {
    return this.collectionsService.findByUser(req.user.id);
  }

  @Get('public/all')
  findPublic(@Request() req) {
    return this.collectionsService.findPublic(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.collectionsService.findOne(id, req.user.id);
  }

  @Post()
  create(@Request() req, @Body() body: { name: string; description?: string; is_public?: boolean }) {
    return this.collectionsService.create(req.user.id, body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() body: { name?: string; description?: string; is_public?: boolean },
  ) {
    return this.collectionsService.update(id, req.user.id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.collectionsService.remove(id, req.user.id);
  }

  @Post(':id/items')
  addItem(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() body: { catalog_item_id: number; stub_id?: number },
  ) {
    return this.collectionsService.addItem(id, req.user.id, body.catalog_item_id, body.stub_id);
  }

  @Delete(':id/items/:catalogItemId')
  removeItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('catalogItemId', ParseIntPipe) catalogItemId: number,
    @Request() req,
  ) {
    return this.collectionsService.removeItem(id, req.user.id, catalogItemId);
  }

  @Patch(':id/items/:catalogItemId/stub')
  linkStub(
    @Param('id', ParseIntPipe) id: number,
    @Param('catalogItemId', ParseIntPipe) catalogItemId: number,
    @Request() req,
    @Body() body: { stub_id: number },
  ) {
    return this.collectionsService.linkStub(id, req.user.id, catalogItemId, body.stub_id);
  }
}

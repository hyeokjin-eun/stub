import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../database/entities';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async findAll() {
    return this.categoryRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다');
    }
    return category;
  }

  async findByCode(code: string) {
    const category = await this.categoryRepo.findOne({ where: { code } });
    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다');
    }
    return category;
  }
}

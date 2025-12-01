import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AbstractService } from 'src/common/abstract.service';
import { Category } from './entities/category.entity';
import { categoryRepository } from './repository/user.repository';

@Injectable()
export class CategoryService extends AbstractService {
  constructor() {
    super(categoryRepository);
  }

  async create(data: CreateCategoryDto): Promise<Category> {
    const category = this.repository.create(data);
    return await this.repository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.find({});
  }

  async findById(id: number): Promise<Category> {
    const category = await this.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: number, data: UpdateCategoryDto): Promise<Category> {
    await this.abstractUpdate(id, data);
    return this.findById(id);
  }

  async remove(id: number): Promise<string> {
    await this.abstractRemove(id);
    return 'Category deleted successfully';
  }
}

import { dataSource } from 'src/core/data-source';
import { Category } from '../entities/category.entity';

export const categoryRepository = dataSource.getRepository(Category);

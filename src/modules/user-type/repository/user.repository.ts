import { dataSource } from 'src/core/data-source';
import { UserType } from '../entities/user-type.entity';

export const userTypeRepository = dataSource.getRepository(UserType);

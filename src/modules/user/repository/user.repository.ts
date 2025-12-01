import { dataSource } from 'src/core/data-source';
import { User } from '../entities/user.entity';

export const userRepository = dataSource.getRepository(User);

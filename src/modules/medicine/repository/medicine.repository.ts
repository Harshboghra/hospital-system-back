import { dataSource } from 'src/core/data-source';
import { Medicine } from '../entities/medicine.entity';

export const medicineRepository = dataSource.getRepository(Medicine);

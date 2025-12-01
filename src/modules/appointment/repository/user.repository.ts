import { dataSource } from 'src/core/data-source';
import { Appointment } from '../entities/appointment.entity';

export const appointmentRepository = dataSource.getRepository(Appointment);

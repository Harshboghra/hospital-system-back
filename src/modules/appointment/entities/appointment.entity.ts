import { Category } from 'src/modules/category/entities/category.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('appointment')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'type', type: 'varchar', length: 50 })
  type: string;

  @Column({ name: 'state', type: 'varchar', length: 20 })
  state: 'upcoming' | 'ongoing' | 'completed';

  @Column({ name: 'time', type: 'timestamp' })
  time: Date;

  @Column({ type: 'integer', name: 'doctorId' })
  doctorId: number;

  @Column({ type: 'integer', name: 'patientId' })
  patientId: number;

  @Column({ type: 'integer', name: 'categoryId', nullable: true })
  categoryId: number;

  @Column({
    name: 'createdAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.appointments, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'doctorId' })
  doctor: User;

  @ManyToOne(() => User, (user) => user.appointments, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'patientId' })
  patient: User;

  @ManyToOne(() => Category, (cat) => cat.appointments, { nullable: true })
  @JoinColumn({ name: 'categoryId', referencedColumnName: 'id' })
  category: Category;
}

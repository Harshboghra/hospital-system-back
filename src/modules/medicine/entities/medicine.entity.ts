import { Appointment } from 'src/modules/appointment/entities/appointment.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('medicine')
export class Medicine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'appointmentId' })
  appointmentId: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({ name: 'dosage', type: 'varchar', length: 50, nullable: true })
  dosage: string;

  @Column({ name: 'instructions', type: 'text', nullable: true })
  instructions: string;

  @Column({
    name: 'createdAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => Appointment, (appointment) => appointment.medicines)
  appointment: Appointment;
}

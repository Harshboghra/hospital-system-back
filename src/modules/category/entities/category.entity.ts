import { Appointment } from 'src/modules/appointment/entities/appointment.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => User, (user) => user.category)
  users: User[];

  @OneToMany(() => Appointment, (appointment) => appointment.category)
  appointments: Appointment[];
}

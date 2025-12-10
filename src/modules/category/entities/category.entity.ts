import { Appointment } from 'src/modules/appointment/entities/appointment.entity';
import { DoctorProfile } from 'src/modules/user/entities/doctor-profile.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => Appointment, (appointment) => appointment.category)
  appointments: Appointment[];

  @OneToMany(() => DoctorProfile, (profile) => profile.category)
  doctorProfiles: DoctorProfile[];
}

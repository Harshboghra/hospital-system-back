import { Appointment } from 'src/modules/appointment/entities/appointment.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { DoctorProfile } from './doctor-profile.entity';
import { PatientProfile } from './patient-profile.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'phoneNumber', type: 'varchar', length: 20, unique: true })
  phoneNumber: string;

  @Column({ name: 'email', type: 'varchar', length: 120, unique: true })
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ type: 'integer', name: 'userTypeId' })
  userTypeId: number;

  @Column({ name: 'profile_image_url', type: 'text', nullable: true })
  profileImageUrl?: string | null;

  @Column({ name: 'profile_image_public_id', type: 'text', nullable: true })
  profileImagePublicId?: string | null;

  @Column({
    name: 'createdAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  doctorAppointments: Appointment[];

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  patientAppointments: Appointment[];

  @OneToOne(() => DoctorProfile, (profile) => profile.user, {
    cascade: true,
  })
  doctorProfile?: DoctorProfile | null;

  @OneToOne(() => PatientProfile, (profile) => profile.user, {
    cascade: true,
  })
  patientProfile?: PatientProfile | null;
}

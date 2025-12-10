import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

export enum BloodGroup {
  A_POS = 'A+',
  A_NEG = 'A-',
  B_POS = 'B+',
  B_NEG = 'B-',
  AB_POS = 'AB+',
  AB_NEG = 'AB-',
  O_POS = 'O+',
  O_NEG = 'O-',
}

@Entity('patient_profile')
export class PatientProfile {
  @PrimaryColumn({ name: 'user_id', type: 'integer' })
  userId: number;

  @Column({
    name: 'blood_group',
    type: 'enum',
    enum: BloodGroup,
    enumName: 'blood_group_enum',
    nullable: true,
  })
  bloodGroup?: BloodGroup | null;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: Date | null;

  @Column({ name: 'gender', type: 'varchar', length: 20, nullable: true })
  gender?: string | null;

  @Column({ name: 'height_cm', type: 'numeric', precision: 5, scale: 2, nullable: true })
  heightCm?: number | null;

  @Column({ name: 'weight_kg', type: 'numeric', precision: 5, scale: 2, nullable: true })
  weightKg?: number | null;

  @Column({ name: 'allergies', type: 'text', nullable: true })
  allergies?: string | null;

  @Column({ name: 'chronic_diseases', type: 'text', nullable: true })
  chronicDiseases?: string | null;

  @Column({ name: 'emergency_contact_name', type: 'varchar', length: 100, nullable: true })
  emergencyContactName?: string | null;

  @Column({ name: 'emergency_contact_phone', type: 'varchar', length: 20, nullable: true })
  emergencyContactPhone?: string | null;

  @OneToOne(() => User, (user) => user.patientProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}


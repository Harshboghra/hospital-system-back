import { Category } from 'src/modules/category/entities/category.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('doctor_profile')
export class DoctorProfile {
  @PrimaryColumn({ name: 'user_id', type: 'integer' })
  userId: number;

  @Column({ type: 'integer', name: 'categoryId', nullable: true })
  categoryId?: number | null;

  @Column({ name: 'registration_no', type: 'varchar', length: 50, nullable: true })
  registrationNo?: string | null;

  @Column({ name: 'years_experience', type: 'integer', nullable: true })
  yearsExperience?: number | null;

  @Column({ name: 'clinic_name', type: 'varchar', length: 150, nullable: true })
  clinicName?: string | null;

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio?: string | null;

  @OneToOne(() => User, (user) => user.doctorProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Category, (category) => category.doctorProfiles, {
    nullable: true,
  })
  @JoinColumn([{ name: 'categoryId', referencedColumnName: 'id' }])
  category?: Category | null;
}


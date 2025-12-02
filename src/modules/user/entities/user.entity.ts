import { Appointment } from 'src/modules/appointment/entities/appointment.entity';
import { Category } from 'src/modules/category/entities/category.entity';
import { UserType } from 'src/modules/user-type/entities/user-type.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

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

  @Column({
    name: 'createdAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => UserType, (userType) => userType.user)
  @JoinColumn([{ name: 'userTypeId', referencedColumnName: 'id' }])
  userType: UserType;

  @OneToMany(
    () => Appointment,
    (appointment) => appointment.doctor || appointment.patient,
  )
  appointments: Appointment[];

  @ManyToOne(() => Category, (category) => category.users)
  @JoinColumn([{ name: 'categoryId', referencedColumnName: 'id' }])
  category: Category;
}

import { UserType } from 'src/modules/user-type/entities/user-type.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
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

  @Column({ type: 'integer', name: 'userTypeId' })
  userTypeId: number;

  @Column({
    name: 'createdAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => UserType, (e) => e.user)
  @JoinColumn([{ name: 'userTypeId', referencedColumnName: 'id' }])
  userType: UserType;
}

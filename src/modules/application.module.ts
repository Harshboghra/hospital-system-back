import { AppointmentModule } from './appointment/appointment.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MedicineModule } from './medicine/medicine.module';
import { UserTypeModule } from './user-type/user-type.module';
import { UserModule } from './user/user.module';

export const ApplicationModules = [
  UserModule,
  UserTypeModule,
  AppointmentModule,
  CategoryModule,
  MedicineModule,
  DashboardModule,
  AuthModule,
  CloudinaryModule,
];

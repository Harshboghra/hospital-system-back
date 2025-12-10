import { AppointmentModule } from './appointment/appointment.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MedicineModule } from './medicine/medicine.module';
import { UserModule } from './user/user.module';

export const ApplicationModules = [
  UserModule,
  AppointmentModule,
  CategoryModule,
  MedicineModule,
  DashboardModule,
  AuthModule,
  CloudinaryModule,
];

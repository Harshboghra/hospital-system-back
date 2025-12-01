import { AppointmentModule } from './appointment/appointment.module';
import { UserTypeModule } from './user-type/user-type.module';
import { UserModule } from './user/user.module';

export const ApplicationModules = [
  UserModule,
  UserTypeModule,
  AppointmentModule,
];

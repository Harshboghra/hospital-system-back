import { Module } from '@nestjs/common';
import { AppointmentModule } from '../appointment/appointment.module';
import { UserModule } from '../user/user.module';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [UserModule, AppointmentModule, CategoryModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [UserModule, AppointmentModule, CategoryModule],
})
export class DashboardModule {}

import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary() {
    return this.dashboardService.getCounts();
  }

  @Get('week-appointments')
  getWeekAppointments() {
    return this.dashboardService.getWeekAppointments();
  }

  @Get('next-week-appointments')
  async getNextWeekAppointments() {
    return this.dashboardService.getNextWeekAppointments();
  }

  @Get('doctor-vs-patient-by-category')
  async getDoctorVsPatientByCategory() {
    return this.dashboardService.getDoctorVsPatientByCategory();
  }
}

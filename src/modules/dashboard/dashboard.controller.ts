import { Controller, Get, Req } from '@nestjs/common';
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

  @Get('doctor-appointments-today')
  async getDoctorAppointmentsToday(@Req() req) {
    const doctorId = req.user?.id;
    return this.dashboardService.getDoctorAppointmentsToday(doctorId);
  }

  @Get('doctor-upcoming-days-appointments')
  async getDoctorUpcomingDaysAppointments(@Req() req) {
    const doctorId = req.user?.id;
    return this.dashboardService.getDoctorUpcomingDaysAppointments(doctorId);
  }

  @Get('doctor-daily-stats')
  async getDoctorDailyStats(@Req() req) {
    const doctorId = req.user?.id;
    return this.dashboardService.getDoctorDailyStats(doctorId);
  }
}

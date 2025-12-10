import { Controller, Get, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { USER_TYPE } from '../user-type/constant';

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

  @Roles(USER_TYPE.PATIENT)
  @Get('patient-dashboard-info')
  async getPatientDashboardInfo(@Req() req) {
    const patientId = req.user?.id;
    return this.dashboardService.getPatientDashboardInfo(patientId);
  }

  @Roles(USER_TYPE.PATIENT)
  @Get('next-appointment-for-patient')
  async getNextAppointmentForPatient(@Req() req) {
    const patientId = req.user?.id;
    return this.dashboardService.getNextAppointmentForPatient(patientId);
  }

  @Roles(USER_TYPE.PATIENT)
  @Get('last-visit-and-medicines')
  async getLastVisitAndMedicines(@Req() req) {
    const patientId = req.user?.id;
    return this.dashboardService.getLastVisitAndMedicines(patientId);
  }
}

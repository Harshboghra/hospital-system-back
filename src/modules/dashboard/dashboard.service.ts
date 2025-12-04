import { Injectable } from '@nestjs/common';
import { Between } from 'typeorm';
import { AppointmentService } from '../appointment/appointment.service';
import { UserService } from '../user/user.service';
import { USER_TYPE } from '../user-type/constant';
import { CategoryService } from '../category/category.service';

@Injectable()
export class DashboardService {
  constructor(
    protected userService: UserService,
    protected appointmentService: AppointmentService,
    protected categoryService: CategoryService,
  ) {}

  async getCounts() {
    const totalDoctors = await this.userService.countByCondition({
      where: { userTypeId: USER_TYPE.DOCTOR },
    });
    const totalPatients = await this.userService.countByCondition({
      where: { userTypeId: USER_TYPE.PATIENT },
    });
    const totalAppointments = await this.appointmentService.count();

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayAppointments = await this.appointmentService.count({
      where: { time: Between(startOfDay, endOfDay) },
    });

    return {
      totalDoctors,
      totalPatients,
      totalAppointments,
      todayAppointments,
    };
  }

  async getWeekAppointments() {
    const today = new Date();

    // End of today (23:59:59.999)
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999,
    );

    // 6 days before today → start date at 00:00:00.000
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 6,
      0,
      0,
      0,
      0,
    );

    // ✅ Get all appointments in the last 7 days
    const appointments = await this.appointmentService.find({
      where: { time: Between(startDate, endOfToday) },
    });

    const labels: string[] = [];
    const data: number[] = [];

    // ✅ Build labels & counts from oldest → newest (startDate → today)
    for (let offset = 0; offset <= 6; offset++) {
      const date = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() + offset,
      );

      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      labels.push(dayLabel);

      const count = appointments.filter((appointment) => {
        const appt = new Date(appointment.time);
        return (
          appt.getFullYear() === date.getFullYear() &&
          appt.getMonth() === date.getMonth() &&
          appt.getDate() === date.getDate()
        );
      }).length;

      data.push(count);
    }

    // Example result if today is Thu:
    // labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"]
    // data:   [1, 3, 0, 2, 5, 1, 4]

    return { labels, data };
  }

  async getNextWeekAppointments() {
    const today = new Date();

    // 👉 Start: tomorrow 00:00
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
      0,
      0,
      0,
      0,
    );

    // 👉 End: 7 days from tomorrow 23:59
    const endDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 7,
      23,
      59,
      59,
      999,
    );

    // Fetch all appointments between tomorrow → next 7 days
    const appointments = await this.appointmentService.find({
      where: {
        time: Between(startDate, endDate),
      },
    });

    const labels: string[] = [];
    const data: number[] = [];

    // Build NEXT 7 DAYS list
    for (let offset = 0; offset < 7; offset++) {
      const date = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() + offset,
      );

      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      labels.push(dayLabel);

      // Count appointments for this date
      const count = appointments.filter((appt) => {
        const d = new Date(appt.time);
        return (
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
        );
      }).length;

      data.push(count);
    }

    return { labels, data };
  }

  async getDoctorVsPatientByCategory() {
    const categories = await this.categoryService.findAll();

    const labels: string[] = [];
    const doctorData: number[] = [];
    const patientData: number[] = [];

    for (const category of categories) {
      labels.push(category.name);

      // 1) Count doctors in this category
      const doctorCount = await this.userService.countByCondition({
        where: {
          userTypeId: USER_TYPE.DOCTOR,
          categoryId: category.id,
        },
      });
      doctorData.push(doctorCount);

      // 2) Find appointments where DOCTOR belongs to this category
      //    (appointment itself does not have categoryId)
      const appointments = await this.appointmentService.find({
        where: {
          doctor: {
            categoryId: category.id,
          },
        },
        relations: ['doctor', 'patient'], // ensure we have patient info
      });

      // 3) Get UNIQUE patients by patient id
      const uniquePatientIds = new Set<number>();

      for (const appt of appointments) {
        // adjust according to your entity shape (patient.id or appt.patientId)
        const patientId = (appt as any).patientId ?? appt.patient?.id; // fallback if you have relation

        if (patientId) {
          uniquePatientIds.add(patientId);
        }
      }

      patientData.push(uniquePatientIds.size);
    }

    return {
      labels, // ["Cardiology", "Ortho", "ENT", ...]
      doctorData, // [3, 2, 1, ...]
      patientData, // [15, 10, 8, ...] (unique patients)
    };
  }
}

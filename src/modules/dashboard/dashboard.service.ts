import { Injectable } from '@nestjs/common';
import { Between } from 'typeorm';
import { AppointmentService } from '../appointment/appointment.service';
import { UserService } from '../user/user.service';
import { USER_TYPE } from '../../common/constant';
import { CategoryService } from '../category/category.service';
import { Appointment } from '../appointment/entities/appointment.entity';
import { APPOINTMENT_STATE } from '../appointment/constant';
import { MedicineService } from '../medicine/medicine.service';
import { Medicine } from '../medicine/entities/medicine.entity';

@Injectable()
export class DashboardService {
  constructor(
    protected userService: UserService,
    protected appointmentService: AppointmentService,
    protected categoryService: CategoryService,
    protected medicineService: MedicineService,
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
      const doctorsInCategory = await this.userService.findDoctorByCategoryId(
        category.id,
      );
      doctorData.push(doctorsInCategory.length);

      // 2) Find appointments where DOCTOR belongs to this category
      const appointments = await this.appointmentService.find({
        relations: ['doctor', 'doctor.doctorProfile', 'patient'],
      });
      const filteredByCategory = appointments.filter(
        (appt) => appt.doctor?.doctorProfile?.categoryId === category.id,
      );

      // 3) Get UNIQUE patients by patient id
      const uniquePatientIds = new Set<number>();

      for (const appt of filteredByCategory) {
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

  async getDoctorAppointmentsToday(doctorId: number) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const appointments: Appointment[] = await this.appointmentService.find({
      where: {
        doctorId,
        time: Between(startOfDay, endOfDay),
      },
      relations: ['patient', 'category'],
      order: { time: 'ASC' },
    });
    return appointments.map((appt) => ({
      id: appt.id,
      time: appt.time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      patientName: appt.patient ? `${appt.patient.name}` : 'Unknown',
      reason: appt.category?.name,
      state: appt.state,
    }));
  }

  async getDoctorUpcomingDaysAppointments(doctorId: number) {
    const today = new Date();
    const upcomingDays = [];
    for (let offset = 0; offset <= 6; offset++) {
      const date = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + offset,
      );

      const dateLabel =
        offset === 1
          ? 'Tomorrow'
          : date.toLocaleDateString('en-US', { weekday: 'short' });

      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0,
        0,
        0,
        0,
      );
      const endOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59,
        999,
      );
      const count = await this.appointmentService.count({
        where: {
          doctorId,
          time: Between(startOfDay, endOfDay),
        },
      });
      upcomingDays.push({ dateLabel, date, count });
    }
    return upcomingDays;
  }

  async getDoctorDailyStats(doctorId: number) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const appointments: Appointment[] = await this.appointmentService.find({
      where: {
        doctorId,
        time: Between(startOfDay, endOfDay),
      },
      order: { time: 'ASC' },
    });
    const stats = {
      totalToday: appointments.length,
      upcoming: appointments.filter(
        (appt) => appt.state === APPOINTMENT_STATE.UPCOMING,
      ).length,
      completed: appointments.filter(
        (appt) => appt.state === APPOINTMENT_STATE.COMPLETED,
      ).length,
      canceled: appointments.filter(
        (appt) => appt.state === APPOINTMENT_STATE.CANCELED,
      ).length,
    };
    return stats;
  }

  async getPatientDashboardInfo(patientId: number) {
    // total upcoming appointments
    const totalUpcoming = await this.appointmentService.countByCondition({
      where: { patientId, state: APPOINTMENT_STATE.UPCOMING },
    });

    // total completed
    const totalCompleted = await this.appointmentService.countByCondition({
      where: { patientId, state: APPOINTMENT_STATE.COMPLETED },
    });

    // last completed appointment (the one that has medicines)
    const lastCompletedAppointment = await this.appointmentService.findOne({
      where: { patientId, state: APPOINTMENT_STATE.COMPLETED },
      order: { time: 'DESC' },
    });

    let activeMedicines = 0;

    if (lastCompletedAppointment) {
      activeMedicines = await this.medicineService.countByCondition({
        where: { appointmentId: lastCompletedAppointment.id },
      });
    }

    return {
      totalUpcoming,
      totalCompleted,
      lastVisitDate: lastCompletedAppointment
        ? lastCompletedAppointment.time
        : null,
      activeMedicines,
    };
  }

  async getNextAppointmentForPatient(patientId: number) {
    const today = new Date();

    const nextAppointment = await this.appointmentService.findOne({
      where: {
        patientId,
        time: Between(today, new Date('2100-12-31')),
        state: APPOINTMENT_STATE.UPCOMING,
      },
      order: { time: 'ASC' },
      relations: ['doctor', 'category'],
    });
    if (!nextAppointment) {
      return null;
    }
    return {
      ...nextAppointment,
      doctorName: nextAppointment.doctor
        ? `Dr. ${nextAppointment.doctor.name}`
        : 'Unknown',
      reason: nextAppointment.category?.name || 'N/A',
    };
  }

  async getLastVisitAndMedicines(patientId: number) {
    // 1) Get last completed appointment
    const lastAppointment = await this.appointmentService.findOne({
      where: {
        patientId,
        state: APPOINTMENT_STATE.COMPLETED,
      },
      order: { time: 'DESC' },
      relations: ['doctor'],
    });
    if (!lastAppointment) {
      return null;
    }
    // 2) Get medicines for that appointment
    const medicines: Medicine[] = await this.medicineService.find({
      where: { appointmentId: lastAppointment.id },
      take: 2,
    });
    return {
      id: lastAppointment.id,
      date: lastAppointment.time,
      doctorName: lastAppointment.doctor.name || '',
      medicines,
    };
  }

  // data Patient
  /* 
    ex 
    {
    Total visits :543
Completed: 12
Cancelled: 12
labels: ["Jun", "Jul", "Aug", "Sep", "Oct"],
data: [1, 3, 2, 4, 2],
      }
  */
  async getPatientAppointmentStats(patientId: number) {
    const totalVisits = await this.appointmentService.countByCondition({
      where: { patientId },
    });
    const completed = await this.appointmentService.countByCondition({
      where: { patientId, state: APPOINTMENT_STATE.COMPLETED },
    });
    const cancelled = await this.appointmentService.countByCondition({
      where: { patientId, state: APPOINTMENT_STATE.CANCELED },
    });
    const today = new Date();
    const labels: string[] = [];
    const data: number[] = [];
    for (let offset = 5; offset >= 0; offset--) {
      const date = new Date(
        today.getFullYear(),
        today.getMonth() - offset,
        1,
      );
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
      labels.push(monthLabel);
      const monthStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        1,
        0,
        0,
        0,
        0,
      );
      const monthEnd = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
      );
      const appointments = await this.appointmentService.count({
        where: {
          patientId,
          time: Between(monthStart, monthEnd),
        },
      });
      data.push(appointments);
    }
    return {
      totalVisits,
      completed,
      cancelled,
      labels,
      data,
    };
  }
}
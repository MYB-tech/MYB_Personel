import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Staff } from '../entities/staff.entity';
import { Apartment } from '../entities/apartment.entity';
import { Task, TaskStatus } from '../entities/task.entity';
import { TaskExecution } from '../entities/task-execution.entity';
import { TaskLog } from '../entities/task-log.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Staff)
        private readonly staffRepo: Repository<Staff>,
        @InjectRepository(Apartment)
        private readonly apartmentRepo: Repository<Apartment>,
        @InjectRepository(Task)
        private readonly taskRepo: Repository<Task>,
        @InjectRepository(TaskExecution)
        private readonly taskExecutionRepo: Repository<TaskExecution>,
        @InjectRepository(TaskLog)
        private readonly logRepo: Repository<TaskLog>,
    ) { }

    async getStats() {
        const totalStaff = await this.staffRepo.count();
        const totalApartments = await this.apartmentRepo.count();

        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const today = dayNames[new Date().getDay()];
        const todayStr = new Date().toISOString().split('T')[0];
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const todayTasks = await this.taskRepo.createQueryBuilder('task')
            .where(':today = ANY(task.scheduled_days)', { today })
            .getCount();

        // Bugün gecikenler: Ya bugün late olarak başlatılmış/bitirilmiş, ya da henüz başlatılmamış ama vakti geçmiş.
        const lateExecutionsCount = await this.taskExecutionRepo.count({
            where: { date: todayStr, is_late: true }
        });

        const pendingLateCount = await this.taskRepo.createQueryBuilder('task')
            .where(':today = ANY(task.scheduled_days)', { today })
            .andWhere('task.schedule_end < :currentTime', { currentTime })
            .andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select('ex.task_id')
                    .from(TaskExecution, 'ex')
                    .where('ex.date = :todayStr', { todayStr })
                    .getQuery();
                return 'task.id NOT IN ' + subQuery;
            })
            .getCount();

        const lateTasks = lateExecutionsCount + pendingLateCount;

        const recentActivities = await this.logRepo.find({
            relations: ['task', 'staff', 'task.apartment'],
            order: { timestamp: 'DESC' },
            take: 5,
        });

        return {
            totalStaff,
            totalApartments,
            todayTasks,
            lateTasks,
            recentActivities,
        };
    }

    async getWeeklySchedule() {
        const staffList = await this.staffRepo.find({ order: { name: 'ASC' } });
        const tasks = await this.taskRepo.find({
            relations: ['apartment', 'staff'],
        });

        // Mevcut haftanın başlangıç ve bitişini bul
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
        const diffToMon = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diffToMon));
        monday.setHours(0, 0, 0, 0);

        const weekDates: string[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            weekDates.push(d.toISOString().split('T')[0]);
        }

        const executions = await this.taskExecutionRepo.find({
            where: {
                date: In(weekDates)
            }
        });

        const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

        const schedule = staffList.map((staff) => {
            const staffTasks = tasks.filter((t) => t.staff_id === staff.id);
            const days = dayNames.map((day, index) => {
                const dayTasks = staffTasks.filter((t) =>
                    t.scheduled_days.includes(day),
                );
                const dateStr = weekDates[index];

                return {
                    day,
                    date: dateStr,
                    tasks: dayTasks.map((t) => {
                        const exec = executions.find(e => e.task_id === t.id && e.date === dateStr);
                        return {
                            id: t.id,
                            type: t.type,
                            apartment: t.apartment?.name || 'Bilinmiyor',
                            time: `${t.schedule_start}-${t.schedule_end}`,
                            status: exec?.status || TaskStatus.PENDING,
                            distance_meters: exec?.distance_meters,
                        };
                    }),
                };
            });
            return {
                staffId: staff.id,
                staffName: staff.name,
                days,
            };
        });

        return schedule;
    }
}

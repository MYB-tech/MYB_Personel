import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../entities/staff.entity';
import { Apartment } from '../entities/apartment.entity';
import { Task, TaskStatus } from '../entities/task.entity';
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
        @InjectRepository(TaskLog)
        private readonly logRepo: Repository<TaskLog>,
    ) { }

    async getStats() {
        const totalStaff = await this.staffRepo.count();
        const totalApartments = await this.apartmentRepo.count();

        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const today = dayNames[new Date().getDay()];
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const todayTasks = await this.taskRepo.createQueryBuilder('task')
            .where(':today = ANY(task.scheduled_days)', { today })
            .getCount();

        const lateTasks = await this.taskRepo.createQueryBuilder('task')
            .where('task.is_late = true')
            .orWhere('(task.status = :status AND :today = ANY(task.scheduled_days) AND task.schedule_end < :currentTime)', {
                status: TaskStatus.PENDING,
                today,
                currentTime,
            })
            .getCount();

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

        const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

        const schedule = staffList.map((staff) => {
            const staffTasks = tasks.filter((t) => t.staff_id === staff.id);
            const days = dayNames.map((day) => {
                const dayTasks = staffTasks.filter((t) =>
                    t.scheduled_days.includes(day),
                );
                return {
                    day,
                    tasks: dayTasks.map((t) => ({
                        id: t.id,
                        type: t.type,
                        apartment: t.apartment?.name || 'Bilinmiyor',
                        time: `${t.schedule_start}-${t.schedule_end}`,
                        status: t.status,
                    })),
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

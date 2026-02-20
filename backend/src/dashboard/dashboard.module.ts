import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Staff } from '../entities/staff.entity';
import { Apartment } from '../entities/apartment.entity';
import { Task } from '../entities/task.entity';
import { TaskLog } from '../entities/task-log.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Staff, Apartment, Task, TaskLog]),
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }

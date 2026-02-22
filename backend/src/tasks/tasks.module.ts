import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Task } from '../entities/task.entity';
import { TaskExecution } from '../entities/task-execution.entity';
import { TaskLog } from '../entities/task-log.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { GeofencingModule } from '../geofencing/geofencing.module';
import { TaskDefinitionsModule } from '../task-definitions/task-definitions.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Task, TaskExecution, TaskLog]),
        BullModule.registerQueue({ name: 'whatsapp' }),
        GeofencingModule,
        TaskDefinitionsModule,
    ],
    controllers: [TasksController],
    providers: [TasksService],
    exports: [TasksService],
})
export class TasksModule { }

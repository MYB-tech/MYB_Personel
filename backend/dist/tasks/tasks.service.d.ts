import { Repository } from 'typeorm';
import type { Queue } from 'bull';
import { Task } from '../entities/task.entity';
import { TaskLog } from '../entities/task-log.entity';
import { GeofencingService } from '../geofencing/geofencing.service';
import { CreateTaskDto, StartTaskDto, CompleteTaskDto } from './dto/task.dto';
export declare class TasksService {
    private readonly taskRepo;
    private readonly logRepo;
    private readonly geofencingService;
    private readonly whatsappQueue;
    private readonly logger;
    constructor(taskRepo: Repository<Task>, logRepo: Repository<TaskLog>, geofencingService: GeofencingService, whatsappQueue: Queue);
    findAll(): Promise<Task[]>;
    findByStaff(staffId: string): Promise<Task[]>;
    findOne(id: string): Promise<Task>;
    create(dto: CreateTaskDto): Promise<Task>;
    remove(id: string): Promise<void>;
    startTask(taskId: string, staffId: string, dto: StartTaskDto): Promise<{
        message: string;
        task: Task;
        distance_meters: number;
        is_late: boolean;
    }>;
    completeTask(taskId: string, staffId: string, dto: CompleteTaskDto): Promise<{
        message: string;
        task: Task;
    }>;
    private checkConflict;
}

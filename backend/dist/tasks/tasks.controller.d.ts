import { TasksService } from './tasks.service';
import { CreateTaskDto, StartTaskDto, CompleteTaskDto } from './dto/task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    findAll(): Promise<import("../entities").Task[]>;
    findMyTasks(req: any): Promise<import("../entities").Task[]>;
    findOne(id: string): Promise<import("../entities").Task>;
    create(dto: CreateTaskDto): Promise<import("../entities").Task>;
    startTask(id: string, req: any, dto: StartTaskDto): Promise<{
        message: string;
        task: import("../entities").Task;
        distance_meters: number;
        is_late: boolean;
    }>;
    completeTask(id: string, req: any, dto: CompleteTaskDto): Promise<{
        message: string;
        task: import("../entities").Task;
    }>;
    remove(id: string): Promise<void>;
}

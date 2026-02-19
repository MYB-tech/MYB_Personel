import { Task } from './task.entity';
import { Staff } from './staff.entity';
export declare class TaskLog {
    id: string;
    task: Task;
    task_id: string;
    staff: Staff;
    staff_id: string;
    action: string;
    location: {
        type: string;
        coordinates: number[];
    } | null;
    distance_meters: number | null;
    timestamp: Date;
}

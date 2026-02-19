import { Staff } from './staff.entity';
import { Apartment } from './apartment.entity';
import { TaskLog } from './task-log.entity';
export declare enum TaskStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    LATE = "LATE",
    OUT_OF_RANGE = "OUT_OF_RANGE"
}
export declare class Task {
    id: string;
    staff: Staff;
    staff_id: string;
    apartment: Apartment;
    apartment_id: string;
    type: string;
    scheduled_days: string[];
    schedule_start: string;
    schedule_end: string;
    status: TaskStatus;
    is_late: boolean;
    started_at: Date | null;
    completed_at: Date | null;
    logs: TaskLog[];
    created_at: Date;
    updated_at: Date;
}

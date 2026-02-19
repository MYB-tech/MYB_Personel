import { Task } from './task.entity';
export declare class Staff {
    id: string;
    name: string;
    phone: string;
    password_hash: string;
    role: string;
    is_active: boolean;
    tasks: Task[];
    created_at: Date;
    updated_at: Date;
}

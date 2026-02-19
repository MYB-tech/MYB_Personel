import { Resident } from './resident.entity';
import { Task } from './task.entity';
export declare class Apartment {
    id: string;
    name: string;
    address: string;
    location: {
        type: string;
        coordinates: number[];
    };
    residents: Resident[];
    tasks: Task[];
    created_at: Date;
    updated_at: Date;
}

export declare class CreateTaskDto {
    staff_id: string;
    apartment_id: string;
    type: string;
    scheduled_days: string[];
    schedule_start: string;
    schedule_end: string;
}
export declare class StartTaskDto {
    latitude: number;
    longitude: number;
}
export declare class CompleteTaskDto {
    latitude?: number;
    longitude?: number;
}

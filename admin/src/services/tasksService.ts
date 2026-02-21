import api from './api';
import type { Staff } from './staffService';
import type { Apartment } from './apartmentsService';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'LATE' | 'OUT_OF_RANGE';

export interface Task {
    id: string;
    staff_id: string;
    staff?: Staff;
    apartment_id: string;
    apartment?: Apartment;
    type: string;
    scheduled_days: string[];
    schedule_start: string;
    schedule_end: string;
    status: TaskStatus;
    is_late: boolean;
}

export interface CreateTaskDto {
    staff_id: string;
    apartment_id: string;
    type: string;
    scheduled_days: string[];
    schedule_start: string;
    schedule_end: string;
}

export const tasksService = {
    getAll: async () => {
        const response = await api.get<Task[]>('/tasks');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Task>(`/tasks/${id}`);
        return response.data;
    },

    create: async (data: CreateTaskDto) => {
        const response = await api.post<Task>('/tasks', data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/tasks/${id}`);
    },
};

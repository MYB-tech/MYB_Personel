import api from './api';

export interface TaskDefinition {
    id: string;
    name: string;
    icon?: string;
    message_template_id?: number;
    message_template?: any;
    created_at?: string;
}

export const taskDefinitionsService = {
    getAll: async () => {
        const response = await api.get<TaskDefinition[]>('/task-definitions');
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await api.get<TaskDefinition>(`/task-definitions/${id}`);
        return response.data;
    },
    create: async (data: Partial<TaskDefinition>) => {
        const response = await api.post<TaskDefinition>('/task-definitions', data);
        return response.data;
    },
    update: async (id: string, data: Partial<TaskDefinition>) => {
        const response = await api.put<TaskDefinition>(`/task-definitions/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/task-definitions/${id}`);
    }
};

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
        const response = await axios.get<TaskDefinition[]>(`${API_URL}/task-definitions`, { withCredentials: true });
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await axios.get<TaskDefinition>(`${API_URL}/task-definitions/${id}`, { withCredentials: true });
        return response.data;
    },
    create: async (data: Partial<TaskDefinition>) => {
        const response = await axios.post<TaskDefinition>(`${API_URL}/task-definitions`, data, { withCredentials: true });
        return response.data;
    },
    update: async (id: string, data: Partial<TaskDefinition>) => {
        const response = await axios.put<TaskDefinition>(`${API_URL}/task-definitions/${id}`, data, { withCredentials: true });
        return response.data;
    },
    delete: async (id: string) => {
        await axios.delete(`${API_URL}/task-definitions/${id}`, { withCredentials: true });
    }
};

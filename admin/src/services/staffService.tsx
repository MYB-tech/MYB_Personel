import api from './api';

export interface Staff {
    id: string;
    name: string;
    phone: string;
    password?: string;
    role: 'admin' | 'field';
    is_active: boolean;
    created_at?: string;
}

export const staffService = {
    getAll: async () => {
        const response = await api.get<Staff[]>('/staff');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Staff>(`/staff/${id}`);
        return response.data;
    },

    create: async (data: Partial<Staff>) => {
        const response = await api.post<Staff>('/staff', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Staff>) => {
        const response = await api.put<Staff>(`/staff/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/staff/${id}`);
    },
};

import api from './api';

export interface MessageTemplate {
    id: number;
    name: string;
    content: string;
    is_meta: boolean;
    meta_template_name: string | null;
    meta_language: string;
    created_at: string;
    updated_at: string;
}

export const messageTemplatesService = {
    findAll: async () => {
        const response = await api.get<MessageTemplate[]>('/message-templates');
        return response.data;
    },

    findOne: async (id: number) => {
        const response = await api.get<MessageTemplate>(`/message-templates/${id}`);
        return response.data;
    },

    create: async (data: Partial<MessageTemplate>) => {
        const response = await api.post<MessageTemplate>('/message-templates', data);
        return response.data;
    },

    update: async (id: number, data: Partial<MessageTemplate>) => {
        const response = await api.patch<MessageTemplate>(`/message-templates/${id}`, data);
        return response.data;
    },

    remove: async (id: number) => {
        await api.delete(`/message-templates/${id}`);
    },
};

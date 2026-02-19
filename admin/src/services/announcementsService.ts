import api from './api';

export interface AnnouncementPreview {
    total: number;
    valid_count: number;
    invalid_count: number;
    valid: any[];
    invalid: { row: number; data: any; error: string }[];
}

export const announcementsService = {
    preview: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<AnnouncementPreview>('/announcements/preview', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    sendBulk: async (recipients: { phone: string; name: string }[], template_name: string) => {
        const response = await api.post('/announcements/send', {
            recipients,
            template_name,
        });
        return response.data;
    },
};

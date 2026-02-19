import api from './api';

export interface Resident {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
}

export interface Apartment {
    id: string;
    name: string;
    address?: string;
    location: {
        type: string;
        coordinates: [number, number]; // [lng, lat]
    };
    residents?: Resident[];
}

export interface CreateApartmentDto {
    name: string;
    address?: string;
    latitude: number;
    longitude: number;
}

export const apartmentsService = {
    getAll: async () => {
        const response = await api.get<Apartment[]>('/apartments');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Apartment>(`/apartments/${id}`);
        return response.data;
    },

    create: async (data: CreateApartmentDto) => {
        const response = await api.post<Apartment>('/apartments', data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateApartmentDto>) => {
        const response = await api.put<Apartment>(`/apartments/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/apartments/${id}`);
    },
};

import api from './api';

export interface DashboardStats {
    totalStaff: number;
    totalApartments: number;
    todayTasks: number;
    lateTasks: number;
    recentActivities: any[];
}

export const getStats = async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};

export const getWeeklySchedule = async (): Promise<any[]> => {
    const response = await api.get('/dashboard/weekly-schedule');
    return response.data;
};

const dashboardService = {
    getStats,
    getWeeklySchedule,
};

export default dashboardService;

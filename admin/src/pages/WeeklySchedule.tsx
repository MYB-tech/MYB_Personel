import { useState, useEffect } from 'react';
import dashboardService from '../services/dashboardService';
import { Calendar, User, Clock, Building2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface ScheduleTask {
    id: string;
    type: string;
    apartment: string;
    time: string;
    status: string;
    distance_meters?: number;
}

interface ScheduleDay {
    day: string;
    tasks: ScheduleTask[];
}

interface StaffSchedule {
    staffId: string;
    staffName: string;
    days: ScheduleDay[];
}

const dayTranslations: Record<string, string> = {
    'MON': 'Pazartesi',
    'TUE': 'Salı',
    'WED': 'Çarşamba',
    'THU': 'Perşembe',
    'FRI': 'Cuma',
    'SAT': 'Cumartesi',
    'SUN': 'Pazar'
};

const taskTypeTranslations: Record<string, string> = {
    'garbage': 'Çöp Toplama',
    'cleaning': 'Temizlik',
    'security': 'Güvenlik Turu'
};

export default function WeeklySchedule() {
    const [schedule, setSchedule] = useState<StaffSchedule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const data = await dashboardService.getWeeklySchedule();
            setSchedule(data);
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Yükleniyor...</span>
            </div>
        );
    }

    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Haftalık Çizelge</h2>
                <p className="text-muted-foreground">Personellerin haftalık görev dağılımı.</p>
            </div>

            <div className="rounded-md border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-muted/50">
                                <th className="p-4 border border-border text-left font-semibold min-w-[200px]">Personel</th>
                                {days.map(day => (
                                    <th key={day} className="p-4 border border-border text-center font-semibold min-w-[150px]">
                                        {dayTranslations[day]}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {schedule.map((staff) => (
                                <tr key={staff.staffId} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4 border border-border">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium">{staff.staffName}</span>
                                        </div>
                                    </td>
                                    {staff.days.map((dayData, idx) => (
                                        <td key={idx} className="p-2 border border-border align-top">
                                            <div className="space-y-2">
                                                {dayData.tasks.length > 0 ? (
                                                    dayData.tasks.map((task) => (
                                                        <div
                                                            key={task.id}
                                                            className={cn(
                                                                "p-2 rounded text-xs border bg-background space-y-1 shadow-sm",
                                                                task.status === 'PENDING' ? "border-blue-200" : "border-green-200 bg-green-50/30"
                                                            )}
                                                        >
                                                            <div className="font-semibold flex items-center gap-1">
                                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                {taskTypeTranslations[task.type] || task.type}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                                <Building2 className="h-3 w-3" />
                                                                {task.apartment}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                                <Clock className="h-3 w-3" />
                                                                {task.time}
                                                            </div>
                                                            {task.distance_meters !== undefined && task.distance_meters !== null && (
                                                                <div className={cn(
                                                                    "text-[10px] font-medium",
                                                                    task.distance_meters > 30 ? "text-red-500" : "text-blue-500"
                                                                )}>
                                                                    Mesafe: {Math.round(task.distance_meters)}m
                                                                    {task.distance_meters > 30 && " (Menzil Dışı)"}
                                                                </div>
                                                            )}
                                                            <div className="mt-1">
                                                                <span className={cn(
                                                                    "px-1.5 py-0.5 rounded-full text-[10px]",
                                                                    task.status === 'PENDING' ? "bg-blue-100 text-blue-700" :
                                                                        task.status === 'COMPLETED' ? "bg-green-100 text-green-700" :
                                                                            task.status === 'COMPLETED_LATE' ? "bg-orange-100 text-orange-700" :
                                                                                task.status === 'IN_PROGRESS' || task.status === 'LATE' ? "bg-blue-100 text-blue-700 font-bold" :
                                                                                    "bg-gray-100 text-gray-700"
                                                                )}>
                                                                    {task.status === 'PENDING' ? 'Bekliyor' :
                                                                        task.status === 'COMPLETED' ? 'Tamamlandı' :
                                                                            task.status === 'COMPLETED_LATE' ? 'Geç Tamamlandı' :
                                                                                task.status === 'IN_PROGRESS' || task.status === 'LATE' ? 'Devam Ediyor' :
                                                                                    task.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-[10px] text-muted-foreground text-center py-2 italic">Görev yok</div>
                                                )}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

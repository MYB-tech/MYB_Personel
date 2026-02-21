import { useState, useEffect } from 'react';
import {
    Users,
    Building2,
    CalendarCheck,
    AlertTriangle,
    CheckCircle2,
    PlayCircle
} from 'lucide-react';
import dashboardService from '../services/dashboardService';
import type { DashboardStats } from '../services/dashboardService';

export default function Dashboard() {
    const [data, setData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const stats = await dashboardService.getStats();
                setData(stats);
            } catch (error) {
                console.error('Stats fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const stats = [
        { label: 'Toplam Personel', value: data?.totalStaff.toString() || '0', icon: Users, color: 'text-blue-500' },
        { label: 'Apartman Sayısı', value: data?.totalApartments.toString() || '0', icon: Building2, color: 'text-indigo-500' },
        { label: 'Bugünkü Görevler', value: data?.todayTasks.toString() || '0', icon: CalendarCheck, color: 'text-green-500' },
        { label: 'Geciken Görevler', value: data?.lateTasks.toString() || '0', icon: AlertTriangle, color: 'text-red-500' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Yükleniyor...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Genel Bakış</h2>
                <p className="text-muted-foreground">Saha operasyonlarının anlık durum özeti.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="p-6 bg-card border border-border rounded-xl shadow-sm">
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-4 grid-cols-1">
                <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-lg font-medium mb-4">Son Aktiviteler</h3>
                    <div className="space-y-4">
                        {data?.recentActivities && data.recentActivities.length > 0 ? (
                            data.recentActivities.map((log) => (
                                <div key={log.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="mt-1">
                                        {log.action === 'START' ? (
                                            <PlayCircle className="h-5 w-5 text-blue-500" />
                                        ) : (
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">{log.staff?.name}</p>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {log.task?.apartment?.name} - {
                                                log.task?.type === 'garbage' ? 'Çöp Toplama' :
                                                    log.task?.type === 'cleaning' ? 'Temizlik' :
                                                        log.task?.type
                                            }
                                            <span className="ml-2 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                                                {log.action === 'START' ? 'Başlatıldı' : 'Tamamlandı'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">Henüz veri yok.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

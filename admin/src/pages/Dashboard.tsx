import {
    Users,
    Building2,
    CalendarCheck,
    AlertTriangle
} from 'lucide-react';

export default function Dashboard() {
    const stats = [
        { label: 'Toplam Personel', value: '12', icon: Users, color: 'text-blue-500' },
        { label: 'Apartman Sayısı', value: '45', icon: Building2, color: 'text-indigo-500' },
        { label: 'Bugünkü Görevler', value: '28', icon: CalendarCheck, color: 'text-green-500' },
        { label: 'Geciken Görevler', value: '3', icon: AlertTriangle, color: 'text-red-500' },
    ];

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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 bg-card border border-border rounded-xl p-6">
                    <h3 className="text-lg font-medium mb-4">Son Aktiviteler</h3>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Henüz veri yok.</p>
                    </div>
                </div>
                <div className="col-span-3 bg-card border border-border rounded-xl p-6">
                    <h3 className="text-lg font-medium mb-4">Canlı Durum</h3>
                    <div className="h-[200px] w-full bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground text-sm">
                        Harita yükleniyor...
                    </div>
                </div>
            </div>
        </div>
    );
}

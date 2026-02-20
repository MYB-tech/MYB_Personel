import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/modal';
import {
    CalendarCheck,
    Plus,
    User,
    Home,
    Clock,
    Calendar,
    Search,
    Trash2,
    CheckCircle2,
    Clock3,
    AlertCircle,
    PlayCircle
} from 'lucide-react';

interface Task {
    id: string;
    staff_id: string;
    apartment_id: string;
    type: string;
    scheduled_days: string[];
    schedule_start: string;
    schedule_end: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'LATE' | 'OUT_OF_RANGE';
    is_late: boolean;
    staff?: { name: string };
    apartment?: { name: string };
    created_at: string;
}

interface Staff {
    id: string;
    name: string;
}

interface Apartment {
    id: string;
    name: string;
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form States
    const [formData, setFormData] = useState({
        staff_id: '',
        apartment_id: '',
        type: 'garbage', // Default
        scheduled_days: [] as string[],
        schedule_start: '08:00',
        schedule_end: '10:00'
    });

    const days = [
        { id: 'MON', label: 'Pzt' },
        { id: 'TUE', label: 'Sal' },
        { id: 'WED', label: 'Çar' },
        { id: 'THU', label: 'Per' },
        { id: 'FRI', label: 'Cum' },
        { id: 'SAT', label: 'Cmt' },
        { id: 'SUN', label: 'Paz' }
    ];

    const fetchAllData = async () => {
        try {
            setIsLoading(true);
            const [tasksRes, staffRes, aptRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/staff'),
                api.get('/apartments')
            ]);
            setTasks(tasksRes.data);
            setStaffList(staffRes.data.filter((s: any) => s.role === 'field')); // Sadece saha çalışanları
            setApartments(aptRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const toggleDay = (dayId: string) => {
        setFormData(prev => ({
            ...prev,
            scheduled_days: prev.scheduled_days.includes(dayId)
                ? prev.scheduled_days.filter(d => d !== dayId)
                : [...prev.scheduled_days, dayId]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.scheduled_days.length === 0) {
            alert('Lütfen en az bir gün seçin');
            return;
        }
        try {
            await api.post('/tasks', formData);
            setIsModalOpen(false);
            setFormData({
                staff_id: '',
                apartment_id: '',
                type: 'garbage',
                scheduled_days: [],
                schedule_start: '08:00',
                schedule_end: '10:00'
            });
            fetchAllData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Görev oluşturulurken çakışma veya hata oluştu');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bu görevi silmek istediğinize emin misiniz?')) {
            try {
                await api.delete(`/tasks/${id}`);
                fetchAllData();
            } catch (error) {
                alert('Silme işlemi başarısız');
            }
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'COMPLETED': return { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2, label: 'Tamamlandı' };
            case 'IN_PROGRESS': return { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: PlayCircle, label: 'Devam Ediyor' };
            case 'LATE': return { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: AlertCircle, label: 'Gecikmiş' };
            case 'OUT_OF_RANGE': return { color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: AlertCircle, label: 'Mesafe Dışı' };
            default: return { color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: Clock3, label: 'Bekliyor' };
        }
    };

    const filteredTasks = tasks.filter(t =>
        t.staff?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.apartment?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Görev Yönetimi</h2>
                    <p className="text-muted-foreground">Personele görev atayın ve saha operasyonlarını izleyin.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Yeni Görev Ata
                </Button>
            </div>

            <div className="flex items-center gap-2 bg-card border border-border px-3 py-2 rounded-lg max-w-md shadow-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Personel veya apartman ara..."
                    className="bg-transparent border-none outline-none text-sm w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-bottom border-border">
                            <th className="p-4 font-semibold text-sm">Görev / Apartman</th>
                            <th className="p-4 font-semibold text-sm">Personel</th>
                            <th className="p-4 font-semibold text-sm">Zamanlama</th>
                            <th className="p-4 font-semibold text-sm">Durum</th>
                            <th className="p-4 font-semibold text-sm text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-muted-foreground">Yükleniyor...</td>
                            </tr>
                        ) : filteredTasks.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-muted-foreground">Görev bulunamadı.</td>
                            </tr>
                        ) : (
                            filteredTasks.map((task) => {
                                const status = getStatusInfo(task.status);
                                const StatusIcon = status.icon;
                                return (
                                    <tr key={task.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium">{task.type === 'garbage' ? 'Çöp Toplama' : task.type === 'cleaning' ? 'Temizlik' : 'Genel Görev'}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Home className="h-3 w-3" />
                                                {task.apartment?.name}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] text-indigo-500 font-bold border border-indigo-500/20">
                                                    {task.staff?.name.charAt(0)}
                                                </div>
                                                <span className="text-sm">{task.staff?.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs font-medium space-y-1">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {task.scheduled_days.join(', ')}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {task.schedule_start} - {task.schedule_end}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${status.color}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(task.id)}
                                                className="p-1.5 hover:bg-muted rounded-md text-destructive transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Yeni Görev Ata"
            >
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Saha Personeli</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={formData.staff_id}
                                onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                                required
                            >
                                <option value="">Seçiniz...</option>
                                {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Apartman / Site</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={formData.apartment_id}
                                onChange={(e) => setFormData({ ...formData, apartment_id: e.target.value })}
                                required
                            >
                                <option value="">Seçiniz...</option>
                                {apartments.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Görev Türü</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            required
                        >
                            <option value="garbage">Çöp Toplama</option>
                            <option value="cleaning">Temizlik</option>
                            <option value="maintenance">Bakım / Onarım</option>
                            <option value="other">Diğer</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tekrar Günleri</label>
                        <div className="flex flex-wrap gap-2">
                            {days.map(day => (
                                <button
                                    key={day.id}
                                    type="button"
                                    onClick={() => toggleDay(day.id)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${formData.scheduled_days.includes(day.id)
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50'
                                        }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Başlangıç Saati
                            </label>
                            <Input
                                type="time"
                                value={formData.schedule_start}
                                onChange={(e) => setFormData({ ...formData, schedule_start: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Bitiş Saati
                            </label>
                            <Input
                                type="time"
                                value={formData.schedule_end}
                                onChange={(e) => setFormData({ ...formData, schedule_end: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Vazgeç</Button>
                        <Button type="submit">Görevi Tanımla</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

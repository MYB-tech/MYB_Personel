import { useState, useEffect } from 'react';
import { tasksService } from '../services/tasksService';
import type { Task, CreateTaskDto, TaskStatus } from '../services/tasksService';
import { taskDefinitionsService, TaskDefinition } from '../services/taskDefinitionsService';
import { staffService } from '../services/staffService';
import type { Staff } from '../services/staffService';
import { apartmentsService } from '../services/apartmentsService';
import type { Apartment } from '../services/apartmentsService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/modal';
import { Plus, Trash2, Calendar, Clock, MapPin, User, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';

const DAYS = [
    { value: 'MON', label: 'Pazartesi' },
    { value: 'TUE', label: 'Salı' },
    { value: 'WED', label: 'Çarşamba' },
    { value: 'THU', label: 'Perşembe' },
    { value: 'FRI', label: 'Cuma' },
    { value: 'SAT', label: 'Cumartesi' },
    { value: 'SUN', label: 'Pazar' },
];

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [definitions, setDefinitions] = useState<TaskDefinition[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<CreateTaskDto>({
        staff_id: '',
        apartment_id: '',
        type: '',
        definition_id: '',
        scheduled_days: [],
        schedule_start: '19:00',
        schedule_end: '20:00',
    });
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [tData, sData, aData, dData] = await Promise.all([
                tasksService.getAll(),
                staffService.getAll(),
                apartmentsService.getAll(),
                taskDefinitionsService.getAll()
            ]);
            setTasks(tData);
            setStaffList(sData);
            setApartments(aData);
            setDefinitions(dData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
        try {
            await tasksService.delete(id);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleDayToggle = (day: string) => {
        setFormData(prev => {
            const days = prev.scheduled_days.includes(day)
                ? prev.scheduled_days.filter(d => d !== day)
                : [...prev.scheduled_days, day];
            return { ...prev, scheduled_days: days };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.scheduled_days.length === 0) {
            setError('En az bir gün seçmelisiniz.');
            return;
        }

        setFormLoading(true);
        try {
            const created = await tasksService.create(formData);
            setTasks(prev => [created, ...prev]);
            setIsModalOpen(false);
            setFormData({
                staff_id: '',
                apartment_id: '',
                type: '',
                definition_id: '',
                scheduled_days: [],
                schedule_start: '19:00',
                schedule_end: '20:00',
            });
        } catch (err: any) {
            console.error('Error creating task:', err);
            // Backend returns nice conflict messages
            setError(err.response?.data?.message || 'Görev oluşturulurken bir hata oluştu.');
        } finally {
            setFormLoading(false);
        }
    };

    const getStatusBadge = (status: TaskStatus, isLate: boolean) => {
        if (isLate && status !== 'PENDING') {
            return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Gecikmeli</span>;
        }
        switch (status) {
            case 'PENDING':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-500/10 text-gray-500 border border-gray-500/20">Bekliyor</span>;
            case 'IN_PROGRESS':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">Başladı</span>;
            case 'COMPLETED':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">Tamamlandı</span>;
            case 'LATE':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">Gecikti</span>;
            case 'OUT_OF_RANGE':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">Konum Dışı</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Görev Planlama</h2>
                    <p className="text-muted-foreground">Personele görev atayın ve takvimi yönetin.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Yeni Görev
                </Button>
            </div>

            <div className="rounded-md border border-border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Personel</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Apartman</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Görev Tipi</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Zamanlama</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Durum</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center">Yükleniyor...</td>
                                </tr>
                            ) : tasks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">Planlanmış görev yok.</td>
                                </tr>
                            ) : (
                                tasks.map((task) => (
                                    <tr key={task.id} className="border-b border-border transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{task.staff?.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span>{task.apartment?.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">{task.type}</td>
                                        <td className="p-4 align-middle">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{task.scheduled_days.join(', ')}</span>
                                                </div>
                                                <div className="flex items-center gap-1 font-mono text-xs">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{task.schedule_start} - {task.schedule_end}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {getStatusBadge(task.status, task.is_late)}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(task.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Yeni Görev Ata"
                className="max-w-2xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Personel</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={formData.staff_id}
                                onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                                required
                            >
                                <option value="">Seçiniz...</option>
                                {staffList.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Apartman</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={formData.apartment_id}
                                onChange={(e) => setFormData({ ...formData, apartment_id: e.target.value })}
                                required
                            >
                                <option value="">Seçiniz...</option>
                                {apartments.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Görev Tipi</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={formData.definition_id}
                            onChange={(e) => {
                                const def = definitions.find(d => d.id === e.target.value);
                                setFormData({
                                    ...formData,
                                    definition_id: e.target.value,
                                    type: def ? def.name : ''
                                });
                            }}
                            required
                        >
                            <option value="">Seçiniz...</option>
                            {definitions.map(def => (
                                <option key={def.id} value={def.id}>{def.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Günler</label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS.map(day => (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => handleDayToggle(day.value)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                                        formData.scheduled_days.includes(day.value)
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background text-muted-foreground border-border hover:bg-muted"
                                    )}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Başlangıç Saati</label>
                            <Input
                                type="time"
                                value={formData.schedule_start}
                                onChange={(e) => setFormData({ ...formData, schedule_start: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bitiş Saati</label>
                            <Input
                                type="time"
                                value={formData.schedule_end}
                                onChange={(e) => setFormData({ ...formData, schedule_end: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>İptal</Button>
                        <Button type="submit" isLoading={formLoading}>Kaydet</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

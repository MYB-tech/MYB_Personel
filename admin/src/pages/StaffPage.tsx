import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/modal';
import {
    Users,
    UserPlus,
    Edit2,
    Trash2,
    Search,
    ShieldCheck,
    Smartphone
} from 'lucide-react';

interface Staff {
    id: string;
    name: string;
    phone: string;
    role: 'admin' | 'field';
    is_active: boolean;
    created_at: string;
}

export default function StaffPage() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        role: 'field' as 'admin' | 'field'
    });

    const fetchStaff = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/staff');
            setStaffList(response.data);
        } catch (error) {
            console.error('Failed to fetch staff:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingStaff) {
                await api.put(`/staff/${editingStaff.id}`, formData);
            } else {
                await api.post('/staff', formData);
            }
            setIsModalOpen(false);
            setEditingStaff(null);
            setFormData({ name: '', phone: '', password: '', role: 'field' });
            fetchStaff();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Bir hata oluştu');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bu personeli silmek istediğinize emin misiniz?')) {
            try {
                await api.delete(`/staff/${id}`);
                fetchStaff();
            } catch (error) {
                alert('Silme işlemi başarısız');
            }
        }
    };

    const handleEdit = (staff: Staff) => {
        setEditingStaff(staff);
        setFormData({
            name: staff.name,
            phone: staff.phone,
            password: '', // Password stays empty unless changing
            role: staff.role
        });
        setIsModalOpen(true);
    };

    const filteredStaff = staffList.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Personel Yönetimi</h2>
                    <p className="text-muted-foreground">Sistemdeki tüm yönetici ve saha çalışanlarını yönetin.</p>
                </div>
                <Button onClick={() => {
                    setEditingStaff(null);
                    setFormData({ name: '', phone: '', password: '', role: 'field' });
                    setIsModalOpen(true);
                }} className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Yeni Personel
                </Button>
            </div>

            <div className="flex items-center gap-2 bg-card border border-border px-3 py-2 rounded-lg max-w-md shadow-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Personel ara..."
                    className="bg-transparent border-none outline-none text-sm w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-bottom border-border">
                            <th className="p-4 font-semibold text-sm">Ad Soyad</th>
                            <th className="p-4 font-semibold text-sm">Telefon</th>
                            <th className="p-4 font-semibold text-sm">Rol</th>
                            <th className="p-4 font-semibold text-sm">Durum</th>
                            <th className="p-4 font-semibold text-sm text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-muted-foreground">Yükleniyor...</td>
                            </tr>
                        ) : filteredStaff.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-muted-foreground">Personel bulunamadı.</td>
                            </tr>
                        ) : (
                            filteredStaff.map((staff) => (
                                <tr key={staff.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {staff.name.charAt(0)}
                                            </div>
                                            <span className="font-medium">{staff.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">{staff.phone}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${staff.role === 'admin'
                                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                                            }`}>
                                            {staff.role === 'admin' ? <ShieldCheck className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                                            {staff.role === 'admin' ? 'Yönetici' : 'Saha'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`w-2.5 h-2.5 rounded-full inline-block ${staff.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        <span className="ml-2 text-sm">{staff.is_active ? 'Aktif' : 'Pasif'}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(staff)}
                                                className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(staff.id)}
                                                className="p-1.5 hover:bg-muted rounded-md text-destructive transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingStaff ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
            >
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Ad Soyad</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Örn: Ahmet Yılmaz"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Telefon</label>
                        <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Örn: 5331234455"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Şifre {editingStaff && '(Değiştirmek istemiyorsanız boş bırakın)'}</label>
                        <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="******"
                            required={!editingStaff}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Rol</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                        >
                            <option value="field">Saha Görevlisi</option>
                            <option value="admin">Yönetici (Panel Erişimi)</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Vazgeç</Button>
                        <Button type="submit">{editingStaff ? 'Güncelle' : 'Kaydet'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

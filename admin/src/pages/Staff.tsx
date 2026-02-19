import React, { useState, useEffect } from 'react';
import { staffService } from '../services/staffService';
import type { Staff } from '../services/staffService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/modal';
import { Plus, Edit2, Trash2, Search, UserCheck, UserX } from 'lucide-react';

export default function StaffPage() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null); // For edit
    const [formData, setFormData] = useState({ name: '', phone: '', password: '', role: 'field' });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const data = await staffService.getAll();
            setStaffList(data);
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedStaff(null);
        setFormData({ name: '', phone: '', password: '', role: 'field' });
        setIsModalOpen(true);
    };

    const handleEdit = (staff: Staff) => {
        setSelectedStaff(staff);
        setFormData({
            name: staff.name,
            phone: staff.phone,
            password: '', // Don't show password
            role: staff.role
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu personeli silmek istediğinize emin misiniz?')) return;
        try {
            await staffService.delete(id);
            setStaffList(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting staff:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (selectedStaff) {
                // Update
                const updateData: any = { ...formData };
                if (!updateData.password) delete updateData.password;
                const updated = await staffService.update(selectedStaff.id, updateData);
                setStaffList(prev => prev.map(s => s.id === updated.id ? updated : s));
            } else {
                // Create
                const created = await staffService.create(formData as Staff);
                setStaffList(prev => [created, ...prev]);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving staff:', error);
            alert('Kaydedilirken bir hata oluştu.');
        } finally {
            setFormLoading(false);
        }
    };

    const filteredStaff = staffList.filter(staff =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Personel Yönetimi</h2>
                    <p className="text-muted-foreground">Personel ekleyin, düzenleyin veya silin.</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Yeni Personel
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="İsim veya telefon ile ara..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border border-border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Ad Soyad</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Telefon</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Rol</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Durum</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center">Yükleniyor...</td>
                                </tr>
                            ) : filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-muted-foreground">Kayıt bulunamadı.</td>
                                </tr>
                            ) : (
                                filteredStaff.map((staff) => (
                                    <tr key={staff.id} className="border-b border-border transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{staff.name}</td>
                                        <td className="p-4 align-middle">{staff.phone}</td>
                                        <td className="p-4 align-middle capitalize">{staff.role === 'admin' ? 'Yönetici' : 'Saha Personeli'}</td>
                                        <td className="p-4 align-middle">
                                            {staff.is_active ? (
                                                <div className="flex items-center text-green-500 gap-1"><UserCheck size={16} /> Aktif</div>
                                            ) : (
                                                <div className="flex items-center text-red-500 gap-1"><UserX size={16} /> Pasif</div>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(staff)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(staff.id)}>
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
                title={selectedStaff ? "Personeli Düzenle" : "Yeni Personel Ekle"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Ad Soyad</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Telefon</label>
                        <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="5551234567"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Parola {selectedStaff && <span className="text-xs text-muted-foreground">(Değiştirmek istemiyorsanız boş bırakın)</span>}
                        </label>
                        <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required={!selectedStaff}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Rol</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="field">Saha Personeli</option>
                            <option value="admin">Yönetici</option>
                        </select>
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

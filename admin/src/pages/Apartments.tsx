import { useState, useEffect } from 'react';
import { apartmentsService } from '../services/apartmentsService';
import type { Apartment, CreateApartmentDto } from '../services/apartmentsService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/modal';
import { LocationPicker } from '../components/ui/location-picker';
import { Plus, Edit2, Trash2, Search, Users } from 'lucide-react';

export default function ApartmentsPage() {
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApt, setSelectedApt] = useState<Apartment | null>(null);
    const [formData, setFormData] = useState<CreateApartmentDto>({
        name: '',
        address: '',
        latitude: 41.0082,
        longitude: 28.9784
    });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        fetchApartments();
    }, []);

    const fetchApartments = async () => {
        try {
            const data = await apartmentsService.getAll();
            setApartments(data);
        } catch (error) {
            console.error('Error fetching apartments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedApt(null);
        setFormData({ name: '', address: '', latitude: 41.0082, longitude: 28.9784 });
        setIsModalOpen(true);
    };

    const handleEdit = (apt: Apartment) => {
        setSelectedApt(apt);
        setFormData({
            name: apt.name,
            address: apt.address || '',
            latitude: apt.location.coordinates[1], // PostGIS: [lng, lat]
            longitude: apt.location.coordinates[0]
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu apartmanı silmek istediğinize emin misiniz?')) return;
        try {
            await apartmentsService.delete(id);
            setApartments(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error('Error deleting apartment:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (selectedApt) {
                const updated = await apartmentsService.update(selectedApt.id, formData);
                setApartments(prev => prev.map(a => a.id === updated.id ? updated : a));
            } else {
                const created = await apartmentsService.create(formData);
                setApartments(prev => [created, ...prev]);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving apartment:', error);
            alert('Kaydedilirken bir hata oluştu.');
        } finally {
            setFormLoading(false);
        }
    };

    const filtered = apartments.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.address && a.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Apartman Yönetimi</h2>
                    <p className="text-muted-foreground">Apartmanları ve konumlarını yönetin.</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Yeni Apartman
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Apartman adı veya adres ara..."
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
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Apartman Adı</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Adres</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Konum</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Sakinler</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center">Yükleniyor...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-muted-foreground">Kayıt bulunamadı.</td>
                                </tr>
                            ) : (
                                filtered.map((apt) => (
                                    <tr key={apt.id} className="border-b border-border transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{apt.name}</td>
                                        <td className="p-4 align-middle max-w-md truncate">{apt.address || '-'}</td>
                                        <td className="p-4 align-middle text-xs font-mono text-muted-foreground">
                                            {apt.location.coordinates[1].toFixed(5)}, {apt.location.coordinates[0].toFixed(5)}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>{apt.residents?.length || 0} Kişi</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(apt)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(apt.id)}>
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
                title={selectedApt ? "Apartmanı Düzenle" : "Yeni Apartman Ekle"}
                className="max-w-4xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Apartman Adı</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Adres ve Konum Seçimi</label>
                            <LocationPicker
                                latitude={formData.latitude}
                                longitude={formData.longitude}
                                address={formData.address || ''}
                                onLocationSelect={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                                onAddressSelect={(addr) => setFormData({ ...formData, address: addr })}
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

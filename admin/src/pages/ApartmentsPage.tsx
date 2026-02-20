import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/modal';
import { LocationPicker } from '../components/ui/location-picker';
import {
    Building2,
    Plus,
    MapPin,
    Edit2,
    Trash2,
    Search,
    Navigation,
    Home
} from 'lucide-react';

interface Apartment {
    id: string;
    name: string;
    address: string;
    location: {
        type: string;
        coordinates: number[]; // [lng, lat]
    };
    created_at: string;
}

export default function ApartmentsPage() {
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingApt, setEditingApt] = useState<Apartment | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        latitude: 41.0082,
        longitude: 28.9784
    });

    const fetchApartments = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/apartments');
            setApartments(response.data);
        } catch (error) {
            console.error('Failed to fetch apartments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApartments();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingApt) {
                await api.put(`/apartments/${editingApt.id}`, formData);
            } else {
                await api.post('/apartments', formData);
            }
            setIsModalOpen(false);
            setEditingApt(null);
            setFormData({ name: '', address: '', latitude: 41.0082, longitude: 28.9784 });
            fetchApartments();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Bir hata oluştu');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bu apartmanı silmek istediğinize emin misiniz? Bu işlem bağlı tüm görevleri de silebilir.')) {
            try {
                await api.delete(`/apartments/${id}`);
                fetchApartments();
            } catch (error) {
                alert('Silme işlemi başarısız');
            }
        }
    };

    const handleEdit = (apt: Apartment) => {
        setEditingApt(apt);
        setFormData({
            name: apt.name,
            address: apt.address || '',
            latitude: apt.location.coordinates[1],
            longitude: apt.location.coordinates[0]
        });
        setIsModalOpen(true);
    };

    const filteredApts = apartments.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.address && a.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Apartman Yönetimi</h2>
                    <p className="text-muted-foreground">Hizmet verilen apartmanları ve konumlarını yönetin.</p>
                </div>
                <Button onClick={() => {
                    setEditingApt(null);
                    setFormData({ name: '', address: '', latitude: 41.0082, longitude: 28.9784 });
                    setIsModalOpen(true);
                }} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Yeni Apartman
                </Button>
            </div>

            <div className="flex items-center gap-2 bg-card border border-border px-3 py-2 rounded-lg max-w-md shadow-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Apartman ara..."
                    className="bg-transparent border-none outline-none text-sm w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    <div className="col-span-full p-10 text-center text-muted-foreground">Yükleniyor...</div>
                ) : filteredApts.length === 0 ? (
                    <div className="col-span-full p-10 text-center text-muted-foreground">Apartman bulunamadı.</div>
                ) : (
                    filteredApts.map((apt) => (
                        <div key={apt.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                            <div className="p-5 flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <Home className="h-6 w-6" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(apt)}
                                            className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(apt.id)}
                                            className="p-1.5 hover:bg-muted rounded-md text-destructive transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-1">{apt.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    <MapPin className="h-3 w-3 inline mr-1" />
                                    {apt.address || 'Adres belirtilmemiş'}
                                </p>
                                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Navigation className="h-3 w-3" />
                                        {apt.location.coordinates[1].toFixed(4)}, {apt.location.coordinates[0].toFixed(4)}
                                    </div>
                                </div>
                            </div>
                            <div className="px-5 py-3 bg-muted/30 border-t border-border mt-auto">
                                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => handleEdit(apt)}>
                                    Haritada Gör / Düzenle
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingApt ? 'Apartman Düzenle' : 'Yeni Apartman Ekle'}
            >
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Apartman Adı</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Örn: Mavi Marmara Sitesi A Blok"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Adres</label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Apartman açık adresi..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Konum Seçin (Geofencing için)</label>
                        <LocationPicker
                            latitude={formData.latitude}
                            longitude={formData.longitude}
                            onLocationSelect={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-muted-foreground font-bold">Enlem (Latitude)</label>
                            <Input value={formData.latitude} readOnly className="bg-muted/50 text-xs" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-muted-foreground font-bold">Boylam (Longitude)</label>
                            <Input value={formData.longitude} readOnly className="bg-muted/50 text-xs" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Vazgeç</Button>
                        <Button type="submit">{editingApt ? 'Güncelle' : 'Kaydet'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

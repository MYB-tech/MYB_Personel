import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import {
    Navigation,
    Home,
    User,
    RefreshCw,
    Maximize2,
    Calendar
} from 'lucide-react';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom apartment icon
const apartmentIcon = L.divIcon({
    html: `<div class="bg-primary p-1.5 rounded-full border-2 border-white shadow-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
           </div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28]
});

interface Apartment {
    id: string;
    name: string;
    address: string;
    location: {
        coordinates: number[];
    };
}

interface Task {
    id: string;
    type: string;
    status: string;
    staff?: { name: string };
    apartment?: { name: string };
    apartment_id: string;
}

export default function MapPage() {
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [aptRes, taskRes] = await Promise.all([
                api.get('/apartments'),
                api.get('/tasks')
            ]);
            setApartments(aptRes.data);
            setTasks(taskRes.data);
        } catch (error) {
            console.error('Failed to fetch map data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'text-green-500';
            case 'IN_PROGRESS': return 'text-blue-500';
            case 'LATE': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Canlı Takip / Harita</h2>
                    <p className="text-muted-foreground">Tüm apartmanların ve operasyonların coğrafi görünümü.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm hover:bg-muted transition-colors shadow-sm"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Verileri Tazele
                </button>
            </div>

            <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden relative shadow-inner">
                {isLoading && !apartments.length ? (
                    <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-medium">Harita Yükleniyor...</span>
                        </div>
                    </div>
                ) : null}

                <MapContainer
                    center={[41.0082, 28.9784]}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {apartments.map(apt => {
                        const aptTasks = tasks.filter(t => t.apartment_id === apt.id);
                        return (
                            <Marker
                                key={apt.id}
                                position={[apt.location.coordinates[1], apt.location.coordinates[0]]}
                                icon={apartmentIcon}
                            >
                                <Popup>
                                    <div className="min-w-[200px] p-1">
                                        <h3 className="font-bold text-lg mb-1">{apt.name}</h3>
                                        <p className="text-xs text-muted-foreground mb-3">{apt.address}</p>

                                        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground border-b pb-1">Görevler</p>
                                            {aptTasks.length === 0 ? (
                                                <p className="text-xs italic text-muted-foreground">Atanmış görev yok.</p>
                                            ) : (
                                                aptTasks.map(task => (
                                                    <div key={task.id} className="flex flex-col bg-muted/30 p-2 rounded-md border border-border">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-xs font-bold truncate">{task.type === 'garbage' ? 'Çöp' : 'Temizlik'}</span>
                                                            <span className={`text-[10px] font-extrabold ${getStatusColor(task.status)}`}>{task.status}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                                                            <User className="h-3 w-3" />
                                                            {task.staff?.name}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>

                {/* Legend Overlay */}
                <div className="absolute bottom-4 left-4 z-[1000] bg-card/90 backdrop-blur-md p-3 rounded-lg border border-border shadow-xl text-xs space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary shadow-sm"></div>
                        <span className="font-medium">Apartman Konumu</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                        <span className="font-medium">Tamamlanmış Görev</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
                        <span className="font-medium">Devam Ediyor</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                        <span className="font-medium">Gecikmiş / Kritik</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

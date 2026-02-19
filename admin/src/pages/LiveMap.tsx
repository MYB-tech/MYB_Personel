import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { apartmentsService } from '../services/apartmentsService';
import type { Apartment } from '../services/apartmentsService';
import { tasksService } from '../services/tasksService';
import type { Task } from '../services/tasksService';
import { Button } from '../components/ui/button';
import { RefreshCw } from 'lucide-react';

const REFRESH_INTERVAL_MS = 30000; // 30 seconds

// Custom Icons
const aptIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const taskIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function LiveMapPage() {
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchData = async () => {
        setLoading(true);
        try {
            const [apts, tks] = await Promise.all([
                apartmentsService.getAll(),
                tasksService.getAll(),
            ]);
            setApartments(apts);
            setTasks(tks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'PENDING')); // Show active tasks
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching map data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Canlı Operasyon Haritası</h2>
                    <p className="text-muted-foreground">
                        Son güncelleme: {lastUpdated.toLocaleTimeString()}
                    </p>
                </div>
                <Button onClick={fetchData} variant="outline" isLoading={loading}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Yenile
                </Button>
            </div>

            <div className="flex-1 rounded-md border border-border overflow-hidden relative">
                <MapContainer center={[41.0082, 28.9784]} zoom={12} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Apartment Markers */}
                    {apartments.map(apt => (
                        <Marker
                            key={`apt-${apt.id}`}
                            position={[apt.location.coordinates[1], apt.location.coordinates[0]]}
                            icon={aptIcon}
                        >
                            <Popup>
                                <div className="p-1">
                                    <h3 className="font-bold">{apt.name}</h3>
                                    <p className="text-sm">{apt.address}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{apt.residents?.length || 0} Sakin</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Task Markers */}
                    {tasks.map(task => {
                        if (!task.apartment) return null;
                        // Shift task markers slightly to not overlap exactly with apartment
                        const lat = task.apartment.location.coordinates[1] + 0.0001;
                        const lng = task.apartment.location.coordinates[0] + 0.0001;

                        return (
                            <Marker
                                key={`task-${task.id}`}
                                position={[lat, lng]}
                                icon={taskIcon}
                            >
                                <Popup>
                                    <div className="p-1">
                                        <h3 className="font-bold text-green-600">Görev: {task.type}</h3>
                                        <p className="text-sm">Personel: {task.staff?.name}</p>
                                        <p className="text-sm">Durum: {task.status}</p>
                                        <div className="flex items-center gap-1 mt-1 font-mono text-xs">
                                            <span>{task.schedule_start} - {task.schedule_end}</span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}

                </MapContainer>

                {/* Legend Overlay */}
                <div className="absolute bottom-4 left-4 bg-card/90 border border-border p-3 rounded-md shadow-lg z-[1000] text-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/marker-icon-2x-blue.png" className="h-4" alt="blue" />
                        <span>Apartmanlar</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/marker-icon-2x-green.png" className="h-4" alt="green" />
                        <span>Aktif Görevler</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

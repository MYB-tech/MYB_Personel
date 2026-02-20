import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { apartmentsService } from '../services/apartmentsService';
import type { Apartment } from '../services/apartmentsService';
import { tasksService } from '../services/tasksService';
import type { Task } from '../services/tasksService';
import { Button } from '../components/ui/button';
import { RefreshCw } from 'lucide-react';

const REFRESH_INTERVAL_MS = 30000; // 30 seconds

const mapContainerStyle = {
    height: '100%',
    width: '100%'
};

const center = {
    lat: 41.0082,
    lng: 28.9784
};

// Google Maps Marker Icons
const aptIcon = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/marker-icon-blue.png';
const taskIcon = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/marker-icon-green.png';

export default function LiveMapPage() {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
    });

    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [selectedApt, setSelectedApt] = useState<Apartment | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const mapRef = useRef<google.maps.Map | null>(null);

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

    const onLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    const onUnmount = useCallback(() => {
        mapRef.current = null;
    }, []);

    if (!isLoaded) return <div>Yükleniyor...</div>;

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
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={12}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                    }}
                >
                    {/* Apartment Markers */}
                    {apartments.map(apt => (
                        <Marker
                            key={`apt-${apt.id}`}
                            position={{ lat: apt.location.coordinates[1], lng: apt.location.coordinates[0] }}
                            icon={aptIcon}
                            onClick={() => {
                                setSelectedApt(apt);
                                setSelectedTask(null);
                            }}
                        />
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
                                position={{ lat, lng }}
                                icon={taskIcon}
                                onClick={() => {
                                    setSelectedTask(task);
                                    setSelectedApt(null);
                                }}
                            />
                        );
                    })}

                    {selectedApt && (
                        <InfoWindow
                            position={{ lat: selectedApt.location.coordinates[1], lng: selectedApt.location.coordinates[0] }}
                            onCloseClick={() => setSelectedApt(null)}
                        >
                            <div className="p-1">
                                <h3 className="font-bold">{selectedApt.name}</h3>
                                <p className="text-sm">{selectedApt.address}</p>
                                <p className="text-xs text-muted-foreground mt-1">{selectedApt.residents?.length || 0} Sakin</p>
                            </div>
                        </InfoWindow>
                    )}

                    {selectedTask && selectedTask.apartment && (
                        <InfoWindow
                            position={{
                                lat: selectedTask.apartment.location.coordinates[1] + 0.0001,
                                lng: selectedTask.apartment.location.coordinates[0] + 0.0001
                            }}
                            onCloseClick={() => setSelectedTask(null)}
                        >
                            <div className="p-1">
                                <h3 className="font-bold text-green-600">Görev: {selectedTask.type}</h3>
                                <p className="text-sm">Personel: {selectedTask.staff?.name}</p>
                                <p className="text-sm">Durum: {selectedTask.status}</p>
                                <div className="flex items-center gap-1 mt-1 font-mono text-xs">
                                    <span>{selectedTask.schedule_start} - {selectedTask.schedule_end}</span>
                                </div>
                            </div>
                        </InfoWindow>
                    )}

                </GoogleMap>

                {/* Legend Overlay */}
                <div className="absolute bottom-4 left-4 bg-card/90 border border-border p-3 rounded-md shadow-lg z-[1000] text-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <img src={aptIcon} className="h-4" alt="blue" />
                        <span>Apartmanlar</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <img src={taskIcon} className="h-4" alt="green" />
                        <span>Aktif Görevler</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

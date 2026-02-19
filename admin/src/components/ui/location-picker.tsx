import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

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

interface LocationPickerProps {
    latitude: number;
    longitude: number;
    onLocationSelect: (lat: number, lng: number) => void;
}

function LocationMarker({ position, onLocationSelect }: { position: [number, number], onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position ? <Marker position={position} /> : null;
}

export function LocationPicker({ latitude, longitude, onLocationSelect }: LocationPickerProps) {
    // Default center (Istanbul) if no location selected or 0,0
    const center: [number, number] = (latitude && longitude) ? [latitude, longitude] : [41.0082, 28.9784];

    return (
        <div className="h-[300px] w-full rounded-md overflow-hidden border border-input">
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                    position={[latitude || 41.0082, longitude || 28.9784]}
                    onLocationSelect={onLocationSelect}
                />
            </MapContainer>
            <p className="text-xs text-muted-foreground mt-1">Haritadan konum seçmek için tıklayın.</p>
        </div>
    );
}

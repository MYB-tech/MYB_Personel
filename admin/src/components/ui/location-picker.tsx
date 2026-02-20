import { useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { Input } from './input';

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

interface LocationPickerProps {
    latitude: number;
    longitude: number;
    address: string;
    onLocationSelect: (lat: number, lng: number) => void;
    onAddressSelect: (address: string) => void;
}

const mapContainerStyle = {
    height: '100%',
    width: '100%'
};

export function LocationPicker({ latitude, longitude, address, onLocationSelect, onAddressSelect }: LocationPickerProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
        libraries
    });

    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    const center = {
        lat: latitude || 41.0082,
        lng: longitude || 28.9784
    };

    const onLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    const onUnmount = useCallback(() => {
        mapRef.current = null;
    }, []);

    const onAutocompleteLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
        setAutocomplete(autocompleteInstance);
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                onLocationSelect(lat, lng);
                onAddressSelect(place.formatted_address || "");
                mapRef.current?.panTo({ lat, lng });
            }
        }
    };

    const reverseGeocode = (lat: number, lng: number) => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results && results[0]) {
                onAddressSelect(results[0].formatted_address);
            }
        });
    };

    const onMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            onLocationSelect(lat, lng);
            reverseGeocode(lat, lng);
        }
    };

    const onMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            onLocationSelect(lat, lng);
            reverseGeocode(lat, lng);
        }
    };

    if (!isLoaded) return <div>Yükleniyor...</div>;

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Adres Ara</label>
                <Autocomplete
                    onLoad={onAutocompleteLoad}
                    onPlaceChanged={onPlaceChanged}
                >
                    <Input
                        type="text"
                        placeholder="Adres yazın..."
                        value={address}
                        onChange={(e) => onAddressSelect(e.target.value)}
                    />
                </Autocomplete>
            </div>

            <div className="h-[300px] w-full rounded-md overflow-hidden border border-input">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={13}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={onMapClick}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                    }}
                >
                    <Marker
                        position={center}
                        draggable={true}
                        onDragEnd={onMarkerDragEnd}
                    />
                </GoogleMap>
            </div>
            <p className="text-xs text-muted-foreground">Haritadan konum seçmek için tıklayın veya iğneyi sürükleyin.</p>
        </div>
    );
}

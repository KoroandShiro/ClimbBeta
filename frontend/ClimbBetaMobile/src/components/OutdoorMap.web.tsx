// src/components/OutdoorMap.web.tsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para os ícones do leaflet não aparecerem em webpack
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function OutdoorMapWeb({ routes, onSelect }: any) {
    const points = (routes || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        lat: r.latitude ?? 38.7,
        lng: r.longitude ?? -9.3,
        info: `${r.sector ?? ''} · ${r.location ?? ''}`,
    }));

    const center: [number, number] = points.length
        ? [points[0].lat, points[0].lng]
        : [38.7, -9.3];

    return (
        <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points.map((p: any) => (
                <Marker key={p.id} position={[p.lat, p.lng]}>
                    <Popup>
                        <div>
                            <strong>{p.name}</strong>
                            <div style={{ marginTop: 6, fontSize: '12px' }}>{p.info}</div>
                            <button
                                style={{
                                    marginTop: 8,
                                    padding: '6px 12px',
                                    backgroundColor: '#2E7D32',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                                onClick={() => onSelect(p.id)}
                            >
                                Ver Detalhes
                            </button>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

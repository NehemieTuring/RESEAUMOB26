/**
 * FleetMan Mobile - FleetMap Web Component
 * Leaflet-based map for web browsers only
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Type definitions
interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

interface LatLng {
    latitude: number;
    longitude: number;
}

// Vehicle marker interface
export interface VehicleMarker {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    status: 'moving' | 'stopped' | 'idle';
    speed?: number;
    heading?: number;
}

// Geofence interface
export interface GeofenceShape {
    id: number;
    name: string;
    type: 'CIRCLE' | 'POLYGON';
    center?: LatLng;
    radius?: number;
    coordinates?: LatLng[];
    color?: string;
    fillColor?: string;
    isSelected?: boolean;
}

// Props interface
interface FleetMapWebProps {
    vehicles?: VehicleMarker[];
    geofences?: GeofenceShape[];
    initialRegion?: Region;
    onVehiclePress?: (vehicle: VehicleMarker) => void;
    onGeofencePress?: (geofence: GeofenceShape) => void;
    onMapPress?: (coordinate: LatLng) => void;
    onMapLongPress?: (coordinate: LatLng) => void;
    showUserLocation?: boolean;
    zoomEnabled?: boolean;
    scrollEnabled?: boolean;
    selectedVehicleId?: number | null;
    creationMode?: 'CIRCLE' | 'POLYGON' | null;
    tempCenter?: LatLng | null;
    tempRadius?: number;
    tempPoints?: LatLng[];
    style?: any;
}

// Default region (Douala, Cameroon)
const DEFAULT_REGION: Region = {
    latitude: 4.0511,
    longitude: 9.7679,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

export default function FleetMapWeb({
    vehicles = [],
    geofences = [],
    selectedVehicleId,
    onVehiclePress,
    onGeofencePress,
    onMapPress,
    onMapLongPress,
    creationMode,
    tempCenter,
    tempRadius = 100,
    tempPoints = [],
    initialRegion = DEFAULT_REGION,
}: FleetMapWebProps) {
    const { colors, isDarkMode } = useTheme();
    const [mapLoaded, setMapLoaded] = useState(false);
    const [LeafletComponents, setLeafletComponents] = useState<any>(null);

    // Dynamically import Leaflet only on web
    useEffect(() => {
        const loadLeaflet = async () => {
            try {
                // Import Leaflet CSS
                const linkElement = document.createElement('link');
                linkElement.rel = 'stylesheet';
                linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(linkElement);

                // Import react-leaflet components
                const { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } = await import('react-leaflet');
                const L = await import('leaflet');

                // Fix default marker icons
                delete (L.Icon.Default.prototype as any)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                });

                setLeafletComponents({ MapContainer, TileLayer, Marker, Popup, Circle, Polygon, L });
                setMapLoaded(true);
            } catch (error) {
                console.error('Failed to load Leaflet:', error);
            }
        };

        loadLeaflet();
    }, []);

    const getMarkerColor = (status: string) => {
        switch (status) {
            case 'moving': return '#10b981';
            case 'stopped': return '#f59e0b';
            case 'idle': return '#6b7280';
            default: return '#3b82f6';
        }
    };

    // Create custom vehicle icon
    const createVehicleIcon = (status: string, isSelected: boolean) => {
        if (!LeafletComponents?.L) return null;
        const color = getMarkerColor(status);
        const size = isSelected ? 36 : 28;
        const borderWidth = isSelected ? 3 : 0;

        return LeafletComponents.L.divIcon({
            className: 'custom-vehicle-marker',
            html: `
                <div style="
                    width: ${size}px;
                    height: ${size}px;
                    background-color: ${color};
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: ${borderWidth}px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                    </svg>
                </div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
        });
    };

    // Create geofence center icon
    const createGeofenceCenterIcon = () => {
        if (!LeafletComponents?.L) return null;
        return LeafletComponents.L.divIcon({
            className: 'custom-geofence-marker',
            html: `
                <div style="
                    width: 24px;
                    height: 24px;
                    background-color: #3b82f6;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                ">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });
    };

    if (!mapLoaded || !LeafletComponents) {
        return (
            <View style={[styles.container, { backgroundColor: colors.surfaceGlass }]}>
                <View style={styles.loadingContent}>
                    <View style={[styles.mapIconContainer, { backgroundColor: colors.primaryBlue + '20' }]}>
                        <Ionicons name="map" size={48} color={colors.primaryBlue} />
                    </View>
                    <Text style={[styles.loadingTitle, { color: colors.textPrimary }]}>
                        Chargement de la carte...
                    </Text>
                </View>
            </View>
        );
    }

    const { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMapEvents } = LeafletComponents;

    // Sub-component to handle map events
    const MapEventsHandler = () => {
        useMapEvents({
            click: (e: any) => {
                onMapPress?.({
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng,
                });
            },
            contextmenu: (e: any) => {
                onMapLongPress?.({
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng,
                });
            },
        });
        return null;
    };

    // Create vertex icon with number
    const createVertexIcon = (index: number) => {
        if (!LeafletComponents?.L) return null;
        return LeafletComponents.L.divIcon({
            className: 'custom-vertex-marker',
            html: `
                <div style="
                    width: 24px;
                    height: 24px;
                    background-color: #3b82f6;
                    border: 2px solid white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 11px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">
                    ${index + 1}
                </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });
    };

    // Tile layer URL based on theme
    const tileUrl = isDarkMode
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tileAttribution = isDarkMode
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    return (
        <View style={[styles.container, { backgroundColor: colors.surfaceGlass }]}>
            <div style={{ width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden' }}>
                <MapContainer
                    center={[initialRegion?.latitude || 4.0511, initialRegion?.longitude || 9.7679]}
                    zoom={13}
                    style={{ width: '100%', height: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer url={tileUrl} attribution={tileAttribution} />
                    <MapEventsHandler />

                    {/* Vehicle Markers */}
                    {vehicles.map((vehicle) => (
                        <Marker
                            key={`vehicle-${vehicle.id}`}
                            position={[vehicle.latitude, vehicle.longitude]}
                            icon={createVehicleIcon(vehicle.status, selectedVehicleId === vehicle.id)}
                            eventHandlers={{
                                click: () => onVehiclePress?.(vehicle),
                            }}
                        >
                            <Popup>
                                <div style={{ padding: '4px 0' }}>
                                    <strong>{vehicle.name}</strong>
                                    <br />
                                    <span style={{ color: '#666' }}>{vehicle.speed || 0} km/h</span>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Existing Geofences */}
                    {geofences.map((geofence) =>
                        geofence.type === 'CIRCLE' && geofence.center && geofence.radius ? (
                            <React.Fragment key={`geofence-${geofence.id}`}>
                                <Circle
                                    center={[geofence.center.latitude, geofence.center.longitude]}
                                    radius={geofence.radius}
                                    pathOptions={{
                                        color: geofence.isSelected ? '#f97316' : (geofence.color || '#3b82f6'),
                                        fillColor: geofence.isSelected ? 'rgba(249, 115, 22, 0.2)' : (geofence.fillColor || 'rgba(59, 130, 246, 0.2)'),
                                        fillOpacity: 0.3,
                                        weight: geofence.isSelected ? 3 : 2,
                                    }}
                                    eventHandlers={{
                                        click: () => onGeofencePress?.(geofence),
                                    }}
                                />
                                <Marker
                                    position={[geofence.center.latitude, geofence.center.longitude]}
                                    icon={createGeofenceCenterIcon()}
                                >
                                    <Popup>{geofence.name}</Popup>
                                </Marker>
                            </React.Fragment>
                        ) : geofence.type === 'POLYGON' && geofence.coordinates && geofence.coordinates.length >= 3 ? (
                            <Polygon
                                key={`geofence-${geofence.id}`}
                                positions={geofence.coordinates.map(c => [c.latitude, c.longitude])}
                                pathOptions={{
                                    color: geofence.isSelected ? '#f97316' : (geofence.color || '#10b981'),
                                    fillColor: geofence.isSelected ? 'rgba(249, 115, 22, 0.2)' : (geofence.fillColor || 'rgba(16, 185, 129, 0.2)'),
                                    fillOpacity: 0.3,
                                    weight: geofence.isSelected ? 3 : 2,
                                }}
                                eventHandlers={{
                                    click: () => onGeofencePress?.(geofence),
                                }}
                            />
                        ) : null
                    )}

                    {/* Temporary Circle (creation mode) */}
                    {creationMode === 'CIRCLE' && tempCenter && (
                        <Circle
                            center={[tempCenter.latitude, tempCenter.longitude]}
                            radius={tempRadius}
                            pathOptions={{
                                color: '#3b82f6',
                                fillColor: 'rgba(59, 130, 246, 0.2)',
                                fillOpacity: 0.3,
                                weight: 2,
                            }}
                        />
                    )}

                    {/* Temporary Polygon (creation mode) */}
                    {creationMode === 'POLYGON' && tempPoints.length > 0 && (
                        <>
                            {tempPoints.length >= 2 && (
                                <Polygon
                                    positions={tempPoints.map(p => [p.latitude, p.longitude])}
                                    pathOptions={{
                                        color: '#10b981',
                                        fillColor: 'rgba(16, 185, 129, 0.2)',
                                        fillOpacity: 0.3,
                                        weight: 2,
                                    }}
                                />
                            )}
                            {tempPoints.map((p, index) => (
                                <Marker
                                    key={`vertex-${index}`}
                                    position={[p.latitude, p.longitude]}
                                    icon={createVertexIcon(index)}
                                />
                            ))}
                        </>
                    )}
                </MapContainer>
            </div>

            {/* Creation Mode Indicator */}
            {creationMode && (
                <View style={[styles.creationIndicator, { backgroundColor: colors.primaryBlue }]}>
                    <Ionicons
                        name={creationMode === 'CIRCLE' ? 'ellipse-outline' : 'triangle-outline'}
                        size={16}
                        color={colors.white}
                    />
                    <Text style={styles.creationText}>
                        {creationMode === 'CIRCLE'
                            ? 'Cliquez pour définir le centre'
                            : `${tempPoints.length} point${tempPoints.length > 1 ? 's' : ''}`}
                    </Text>
                </View>
            )}

            {/* Stats Overlay */}
            <View style={[styles.statsOverlay, { backgroundColor: colors.surfaceCard + 'E6' }]}>
                {vehicles.length > 0 && (
                    <View style={[styles.statBadge, { backgroundColor: colors.successBg }]}>
                        <Ionicons name="car" size={14} color={colors.successText} />
                        <Text style={[styles.statText, { color: colors.successText }]}>
                            {vehicles.length} véhicules
                        </Text>
                    </View>
                )}
                {geofences.length > 0 && (
                    <View style={[styles.statBadge, { backgroundColor: colors.primaryBlue + '20' }]}>
                        <Ionicons name="location" size={14} color={colors.primaryBlue} />
                        <Text style={[styles.statText, { color: colors.primaryBlue }]}>
                            {geofences.length} zones
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
        borderRadius: 16,
    },
    loadingContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    mapIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    loadingTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    creationIndicator: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    creationText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
    },
    statsOverlay: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        flexDirection: 'row',
        borderRadius: 10,
        padding: 8,
        gap: 8,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
    },
    statText: {
        fontSize: 13,
        fontWeight: '500',
    },
});

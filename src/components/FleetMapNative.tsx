/**
 * FleetMan Mobile - FleetMap Component
 * Native map component using react-native-maps
 * For iOS/Android only - Web uses FleetMapWeb.tsx
 */

import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import MapView, { Marker, Circle, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';

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

interface MapPressEvent {
    nativeEvent: {
        coordinate: LatLng;
    };
}

// Map styles for dark mode
const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
    { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
    { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#64779e' }] },
    { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
    { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#334e87' }] },
    { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
    { featureType: 'poi', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
    { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#023e58' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3C7680' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
    { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#b0d5ce' }] },
    { featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{ color: '#023e58' }] },
    { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
    { featureType: 'transit', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
    { featureType: 'transit.line', elementType: 'geometry.fill', stylers: [{ color: '#283d6a' }] },
    { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#3a4762' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
];

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
interface FleetMapNativeProps {
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

export default function FleetMapNative({
    vehicles = [],
    geofences = [],
    initialRegion = DEFAULT_REGION,
    onVehiclePress,
    onGeofencePress,
    onMapPress,
    onMapLongPress,
    showUserLocation = false,
    zoomEnabled = true,
    scrollEnabled = true,
    selectedVehicleId,
    creationMode,
    tempCenter,
    tempRadius = 100,
    tempPoints = [],
    style,
}: FleetMapNativeProps) {
    const { colors, isDarkMode } = useTheme();
    const mapRef = useRef<any>(null);
    const [mapReady, setMapReady] = useState(false);

    // Zoom to selected vehicle
    useEffect(() => {
        if (mapReady && selectedVehicleId && mapRef.current) {
            const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
            if (selectedVehicle) {
                mapRef.current.animateToRegion({
                    latitude: selectedVehicle.latitude,
                    longitude: selectedVehicle.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }, 500);
            }
        }
    }, [selectedVehicleId, mapReady, vehicles]);

    // Zoom to fit all vehicles
    const fitToVehicles = () => {
        if (mapRef.current && vehicles.length > 0) {
            const coordinates = vehicles.map(v => ({
                latitude: v.latitude,
                longitude: v.longitude,
            }));
            mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        }
    };

    // Get marker color based on vehicle status
    const getMarkerColor = (status: string) => {
        switch (status) {
            case 'moving': return colors.successText;
            case 'stopped': return colors.warningText;
            case 'idle': return colors.textMuted;
            default: return colors.primaryBlue;
        }
    };

    // Handle map press
    const handleMapPress = (event: MapPressEvent) => {
        if (onMapPress) {
            onMapPress(event.nativeEvent.coordinate);
        }
    };

    // Handle map long press
    const handleMapLongPress = (event: MapPressEvent) => {
        if (onMapLongPress) {
            onMapLongPress(event.nativeEvent.coordinate);
        }
    };

    return (
        <View style={[styles.container, style]}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                initialRegion={initialRegion}
                showsUserLocation={showUserLocation}
                showsMyLocationButton={showUserLocation}
                showsCompass={true}
                showsScale={true}
                zoomEnabled={zoomEnabled}
                scrollEnabled={scrollEnabled}
                rotateEnabled={true}
                pitchEnabled={true}
                customMapStyle={isDarkMode ? darkMapStyle : undefined}
                onMapReady={() => setMapReady(true)}
                onPress={handleMapPress}
                onLongPress={handleMapLongPress}
            >
                {/* Vehicle Markers */}
                {vehicles.map((vehicle) => (
                    <Marker
                        key={`vehicle-${vehicle.id}`}
                        coordinate={{
                            latitude: vehicle.latitude,
                            longitude: vehicle.longitude,
                        }}
                        title={vehicle.name}
                        description={`${vehicle.speed || 0} km/h`}
                        onPress={() => onVehiclePress?.(vehicle)}
                        pinColor={getMarkerColor(vehicle.status)}
                        tracksViewChanges={false}
                    >
                        <View style={[
                            styles.vehicleMarker,
                            {
                                backgroundColor: getMarkerColor(vehicle.status),
                                borderColor: selectedVehicleId === vehicle.id ? colors.white : 'transparent',
                                borderWidth: selectedVehicleId === vehicle.id ? 3 : 0,
                            }
                        ]}>
                            <Ionicons
                                name="car"
                                size={16}
                                color={colors.white}
                                style={vehicle.heading ? { transform: [{ rotate: `${vehicle.heading}deg` }] } : undefined}
                            />
                        </View>
                    </Marker>
                ))}

                {/* Existing Geofences */}
                {geofences.map((geofence) => (
                    geofence.type === 'CIRCLE' && geofence.center && geofence.radius ? (
                        <React.Fragment key={`geofence-${geofence.id}`}>
                            <Circle
                                center={geofence.center}
                                radius={geofence.radius}
                                strokeColor={geofence.isSelected ? '#f97316' : (geofence.color || colors.primaryBlue)}
                                fillColor={geofence.isSelected
                                    ? 'rgba(249, 115, 22, 0.2)'
                                    : (geofence.fillColor || `${colors.primaryBlue}33`)}
                                strokeWidth={geofence.isSelected ? 3 : 2}
                                onPress={() => onGeofencePress?.(geofence)}
                            />
                            <Marker
                                coordinate={geofence.center}
                                title={geofence.name}
                                anchor={{ x: 0.5, y: 0.5 }}
                                onPress={() => onGeofencePress?.(geofence)}
                            >
                                <View style={[styles.geofenceCenter, { backgroundColor: colors.primaryBlue }]}>
                                    <Ionicons name="location" size={12} color={colors.white} />
                                </View>
                            </Marker>
                        </React.Fragment>
                    ) : geofence.type === 'POLYGON' && geofence.coordinates && geofence.coordinates.length >= 3 ? (
                        <Polygon
                            key={`geofence-${geofence.id}`}
                            coordinates={geofence.coordinates}
                            strokeColor={geofence.isSelected ? '#f97316' : (geofence.color || colors.successText)}
                            fillColor={geofence.isSelected
                                ? 'rgba(249, 115, 22, 0.2)'
                                : (geofence.fillColor || `${colors.successText}33`)}
                            strokeWidth={geofence.isSelected ? 3 : 2}
                            onPress={() => onGeofencePress?.(geofence)}
                        />
                    ) : null
                ))}

                {/* Temporary Circle (creation mode) */}
                {creationMode === 'CIRCLE' && tempCenter && (
                    <>
                        <Circle
                            center={tempCenter}
                            radius={tempRadius}
                            strokeColor={colors.primaryBlue}
                            fillColor={`${colors.primaryBlue}33`}
                            strokeWidth={2}
                        />
                        <Marker
                            coordinate={tempCenter}
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <View style={[styles.tempMarker, { backgroundColor: colors.primaryBlue }]}>
                                <Ionicons name="add" size={16} color={colors.white} />
                            </View>
                        </Marker>
                    </>
                )}

                {/* Temporary Polygon Points (creation mode) */}
                {creationMode === 'POLYGON' && tempPoints.length > 0 && (
                    <>
                        {tempPoints.map((point, index) => (
                            <Marker
                                key={`temp-point-${index}`}
                                coordinate={point}
                                anchor={{ x: 0.5, y: 0.5 }}
                            >
                                <View style={[styles.tempPointMarker, { backgroundColor: colors.successText }]}>
                                    <Text style={styles.tempPointText}>{index + 1}</Text>
                                </View>
                            </Marker>
                        ))}
                        {tempPoints.length >= 2 && (
                            <Polygon
                                coordinates={tempPoints}
                                strokeColor={colors.successText}
                                fillColor={`${colors.successText}33`}
                                strokeWidth={2}
                            />
                        )}
                    </>
                )}
            </MapView>

            {/* Map Controls */}
            <View style={[styles.controlsContainer, { backgroundColor: colors.surfaceCard }]}>
                {vehicles.length > 0 && (
                    <TouchableOpacity
                        style={[styles.controlButton, { backgroundColor: colors.surfaceGlass }]}
                        onPress={fitToVehicles}
                    >
                        <Ionicons name="scan-outline" size={20} color={colors.primaryBlue} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: colors.surfaceGlass }]}
                    onPress={() => mapRef.current?.animateToRegion(initialRegion, 500)}
                >
                    <Ionicons name="locate-outline" size={20} color={colors.primaryBlue} />
                </TouchableOpacity>
            </View>

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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
        borderRadius: 16,
    },
    map: {
        flex: 1,
    },
    vehicleMarker: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    geofenceCenter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tempMarker: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    tempPointMarker: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    tempPointText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
    },
    controlsContainer: {
        position: 'absolute',
        right: 12,
        top: 12,
        borderRadius: 12,
        padding: 4,
        gap: 4,
    },
    controlButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
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
});

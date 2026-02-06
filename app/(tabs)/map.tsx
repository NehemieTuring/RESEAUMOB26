/**
 * FleetMan Mobile - Map Screen
 * Real-time vehicle tracking map with react-native-maps
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { vehicleApi } from '../../src/services';
import { FleetMap, VehicleMarker, DashboardHeader } from '../../src/components';

const { height } = Dimensions.get('window');

interface VehicleLocation {
    vehicleId: number;
    vehicleName: string;
    vehicleMake: string;
    vehicleRegistrationNumber: string;
    state: string;
    speed?: number;
    latitude?: number;
    longitude?: number;
    driverName?: string;
}

export default function MapScreen() {
    const { t } = useTranslation();
    const { colors, isDarkMode } = useTheme();
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [vehicles, setVehicles] = useState<VehicleLocation[]>([]);

    const FILTERS = useMemo(() => [
        { key: 'all', label: t('map.all') },
        { key: 'moving', label: t('map.moving') },
        { key: 'stopped', label: t('map.stopped') },
    ], [t]);

    // Fetch vehicles with location data from API
    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const data = await vehicleApi.getAll();
            // Map API response to VehicleLocation format
            const mappedData: VehicleLocation[] = data.map((v: any) => ({
                vehicleId: v.vehicleId,
                vehicleName: v.vehicleName || '',
                vehicleMake: v.vehicleMake || '',
                vehicleRegistrationNumber: v.vehicleRegistrationNumber || '',
                state: v.state || 'STOPPED',
                speed: v.speed || 0,
                latitude: v.latitude,
                longitude: v.longitude,
                driverName: v.driverName || null,
            }));
            setVehicles(mappedData);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            setVehicles([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchVehicles();
    }, []);

    // Filter vehicles based on selected filter
    const filteredVehicles = useMemo(() => {
        if (selectedFilter === 'all') return vehicles;
        if (selectedFilter === 'moving') return vehicles.filter(v => v.state === 'IN_SERVICE' || (v.speed && v.speed > 0));
        if (selectedFilter === 'stopped') return vehicles.filter(v => v.state !== 'IN_SERVICE' && (!v.speed || v.speed === 0));
        return vehicles;
    }, [vehicles, selectedFilter]);

    // Get counts for filter badges
    const filterCounts = useMemo(() => ({
        all: vehicles.length,
        moving: vehicles.filter(v => v.state === 'IN_SERVICE' || (v.speed && v.speed > 0)).length,
        stopped: vehicles.filter(v => v.state !== 'IN_SERVICE' && (!v.speed || v.speed === 0)).length,
    }), [vehicles]);

    // Convert vehicles to map markers
    const vehicleMarkers: VehicleMarker[] = useMemo(() => {
        return filteredVehicles
            .filter(v => v.latitude && v.longitude)
            .map(v => ({
                id: v.vehicleId,
                name: `${v.vehicleMake} ${v.vehicleName}`.trim() || v.vehicleRegistrationNumber,
                latitude: v.latitude!,
                longitude: v.longitude!,
                status: (v.state === 'IN_SERVICE' || (v.speed && v.speed > 0)) ? 'moving' : 'stopped',
                speed: v.speed,
            }));
    }, [filteredVehicles]);

    const getVehicleStatus = (vehicle: VehicleLocation) => {
        if (vehicle.state === 'IN_SERVICE' || (vehicle.speed && vehicle.speed > 0)) {
            return 'moving';
        }
        return 'stopped';
    };

    const handleVehiclePress = (marker: VehicleMarker) => {
        setSelectedVehicle(marker.id);
    };

    const renderVehicleItem = ({ item }: { item: VehicleLocation }) => {
        const status = getVehicleStatus(item);
        return (
            <TouchableOpacity
                style={[
                    styles.vehicleItem,
                    { borderBottomColor: colors.borderGlass },
                    selectedVehicle === item.vehicleId && { backgroundColor: colors.surfaceGlass }
                ]}
                onPress={() => setSelectedVehicle(item.vehicleId)}
            >
                <View style={[
                    styles.vehicleIcon,
                    { backgroundColor: status === 'moving' ? colors.successBg : colors.warningBg }
                ]}>
                    <Ionicons
                        name="car"
                        size={18}
                        color={status === 'moving' ? colors.successText : colors.warningText}
                    />
                </View>
                <View style={styles.vehicleInfo}>
                    <Text style={[styles.vehicleName, { color: colors.textPrimary }]}>
                        {item.vehicleMake} {item.vehicleName}
                    </Text>
                    <Text style={[styles.vehicleReg, { color: colors.textMuted }]}>
                        {item.vehicleRegistrationNumber}
                    </Text>
                </View>
                <View style={styles.vehicleStats}>
                    <Text style={[styles.vehicleSpeed, { color: colors.textPrimary }]}>
                        {item.speed || 0} km/h
                    </Text>
                    {item.driverName && (
                        <Text style={[styles.vehicleDriver, { color: colors.textSecondary }]}>
                            {item.driverName}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.primaryDark }]}>
                <ActivityIndicator size="large" color={colors.primaryBlue} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('common.loading')}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryDark }]} edges={['top']}>
            {isDarkMode && (
                <LinearGradient
                    colors={[colors.primaryDark, '#0f172a', colors.primaryDark]}
                    style={StyleSheet.absoluteFillObject}
                />
            )}

            {/* Dashboard Header */}
            <DashboardHeader showSearch={false} onRefresh={onRefresh} isRefreshing={refreshing} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>{t('map.title')}</Text>
                    <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
                        {vehicles.length} {t('map.vehiclesOnMap')}
                    </Text>
                </View>
            </View>

            {/* Filter Chips */}
            <View style={styles.filterContainer}>
                {FILTERS.map((filter) => (
                    <TouchableOpacity
                        key={filter.key}
                        style={[
                            styles.filterChip,
                            { backgroundColor: colors.surfaceGlass, borderColor: colors.borderGlass },
                            selectedFilter === filter.key && {
                                backgroundColor: colors.primaryBlue,
                                borderColor: colors.primaryBlue
                            }
                        ]}
                        onPress={() => setSelectedFilter(filter.key)}
                    >
                        <Text style={[
                            styles.filterText,
                            { color: colors.textSecondary },
                            selectedFilter === filter.key && { color: colors.white }
                        ]}>
                            {filter.label} ({filterCounts[filter.key as keyof typeof filterCounts]})
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Interactive Map */}
            <View style={[styles.mapContainer, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                <FleetMap
                    vehicles={vehicleMarkers}
                    selectedVehicleId={selectedVehicle}
                    onVehiclePress={handleVehiclePress}
                    showUserLocation={false}
                />

                {/* Vehicle Markers Legend */}
                <View style={[styles.legend, { backgroundColor: colors.surfaceCard + 'E6' }]}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.successText }]} />
                        <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                            {t('map.moving')} ({filterCounts.moving})
                        </Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.warningText }]} />
                        <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                            {t('map.stopped')} ({filterCounts.stopped})
                        </Text>
                    </View>
                </View>
            </View>

            {/* Vehicle List */}
            <View style={[styles.vehicleList, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                <Text style={[styles.listTitle, { color: colors.textPrimary }]}>{t('navigation.vehicles')}</Text>
                {filteredVehicles.length > 0 ? (
                    <FlatList
                        data={filteredVehicles}
                        renderItem={renderVehicleItem}
                        keyExtractor={(item) => item.vehicleId.toString()}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryBlue} />
                        }
                    />
                ) : (
                    <View style={styles.emptyList}>
                        <Ionicons name="car-outline" size={32} color={colors.textMuted} />
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                            {t('vehicles.noVehicles')}
                        </Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14 },
    header: { padding: 16, paddingTop: 8 },
    pageTitle: { fontSize: 24, fontWeight: '700' },
    pageSubtitle: { fontSize: 14, marginTop: 4 },
    filterContainer: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 8 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
    filterText: { fontSize: 13, fontWeight: '500' },
    mapContainer: { flex: 1, marginHorizontal: 16, borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
    legend: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 24,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 12 },
    vehicleList: { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16, maxHeight: height * 0.25 },
    listTitle: { fontSize: 16, fontWeight: '600', padding: 16, paddingBottom: 8 },
    vehicleItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
    vehicleIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    vehicleInfo: { flex: 1 },
    vehicleName: { fontSize: 14, fontWeight: '600' },
    vehicleReg: { fontSize: 11, marginTop: 2 },
    vehicleStats: { alignItems: 'flex-end' },
    vehicleSpeed: { fontSize: 14, fontWeight: '600' },
    vehicleDriver: { fontSize: 11, marginTop: 2 },
    emptyList: { alignItems: 'center', paddingVertical: 24 },
    emptyText: { marginTop: 8, fontSize: 14 },
});


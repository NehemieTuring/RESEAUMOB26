/**
 * FleetMan Mobile - History Screen
 * Trip history matching web design with stats cards and filters
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Dimensions,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { tripApi, Trip, incidentApi } from '../../src/services';
import { Incident } from '../../src/services/incidentApi';
import { DashboardHeader, DataDetailsModal, BackendOfflineBanner } from '../../src/components';
import { checkBackendHealth } from '../../src/services/healthCheck';

const { width } = Dimensions.get('window');

type FilterType = 'all' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface TripStats {
    totalTrips: number;
    totalDistance: number;
    completedTrips: number;
    inProgressTrips: number;
}

export default function HistoryScreen() {
    const { t } = useTranslation();
    const { colors, isDarkMode } = useTheme();
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [stats, setStats] = useState<TripStats>({
        totalTrips: 0,
        totalDistance: 0,
        completedTrips: 0,
        inProgressTrips: 0,
    });
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [backendOnline, setBackendOnline] = useState<boolean>(true);
    const [backendError, setBackendError] = useState<string | null>(null);

    const FILTERS: { key: FilterType; label: string }[] = useMemo(() => [
        { key: 'all', label: 'Tous' },
        { key: 'IN_PROGRESS', label: 'En cours' },
        { key: 'COMPLETED', label: 'Terminé' },
        { key: 'CANCELLED', label: 'Annulé' },
    ], []);

    // Fetch trips from API
    const fetchTrips = async () => {
        try {
            setLoading(true);
            setBackendError(null);

            // Get user from AsyncStorage for admin filtering
            const userStr = await AsyncStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const adminId = user?.adminId || user?.userId;

            const data = await tripApi.getAll(adminId);

            // If we reach here, backend is online
            setBackendOnline(true);
            setBackendError(null);

            setTrips(data);

            // Calculate stats
            const totalDistance = data.reduce((sum: number, trip: Trip) =>
                sum + (trip.actualDistance || trip.plannedDistance || 0), 0);
            const completedTrips = data.filter((t: Trip) => t.status === 'COMPLETED').length;
            const inProgressTrips = data.filter((t: Trip) => t.status === 'IN_PROGRESS').length;

            setStats({
                totalTrips: data.length,
                totalDistance,
                completedTrips,
                inProgressTrips,
            });
        } catch (error: any) {
            console.error('Error fetching trips:', error);
            setBackendOnline(false);
            setBackendError(error.message || 'Erreur de connexion au serveur');
            // Clear data when backend is offline
            setTrips([]);
            setStats({
                totalTrips: 0,
                totalDistance: 0,
                completedTrips: 0,
                inProgressTrips: 0,
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTrips();
    }, []);

    // Filter and search trips
    const filteredTrips = useMemo(() => {
        let filtered = trips;

        // Apply status filter
        if (selectedFilter !== 'all') {
            filtered = filtered.filter(trip => trip.status === selectedFilter);
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(trip =>
                trip.tripReference?.toLowerCase().includes(query) ||
                trip.driverName?.toLowerCase().includes(query) ||
                trip.vehicleRegistration?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [trips, selectedFilter, searchQuery]);

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    const handleShowDetails = (trip: Trip) => {
        setSelectedTrip(trip);
        setIsDetailsModalVisible(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return colors.successText;
            case 'IN_PROGRESS': return colors.primaryBlue;
            case 'CANCELLED': return colors.errorText;
            case 'PLANNED': return colors.warningText;
            default: return colors.textSecondary;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'Terminé';
            case 'IN_PROGRESS': return 'En cours';
            case 'CANCELLED': return 'Annulé';
            case 'PLANNED': return 'Planifié';
            default: return status;
        }
    };

    // Stats Card Component
    const StatsCard = ({
        icon,
        iconColor,
        value,
        label
    }: {
        icon: keyof typeof Ionicons.glyphMap;
        iconColor: string;
        value: string;
        label: string;
    }) => (
        <View style={[styles.statsCard, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
            <View style={[styles.statsIconContainer, { backgroundColor: iconColor + '20' }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <View style={styles.statsContent}>
                <Text style={[styles.statsValue, { color: colors.textPrimary }]}>{value}</Text>
                <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>{label}</Text>
            </View>
        </View>
    );

    const renderTripItem = ({ item }: { item: Trip }) => (
        <TouchableOpacity
            style={[styles.tripCard, {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.borderGlass,
            }]}
            activeOpacity={0.7}
            onPress={() => handleShowDetails(item)}
        >
            <View style={[styles.tripIconContainer, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Ionicons
                    name={item.status === 'COMPLETED' ? 'checkmark-circle' :
                        item.status === 'IN_PROGRESS' ? 'navigate' :
                            item.status === 'CANCELLED' ? 'close-circle' : 'time'}
                    size={24}
                    color={getStatusColor(item.status)}
                />
            </View>
            <View style={styles.tripContent}>
                <View style={styles.tripHeader}>
                    <Text style={[styles.tripReference, { color: colors.textPrimary }]}>
                        {item.tripReference || `Trajet #${item.tripId}`}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {getStatusLabel(item.status)}
                        </Text>
                    </View>
                </View>
                <Text style={[styles.tripDetails, { color: colors.textSecondary }]}>
                    {item.vehicleRegistration || 'Véhicule non assigné'} • {item.driverName || 'Chauffeur non assigné'}
                </Text>
                <View style={styles.tripMeta}>
                    <View style={styles.tripMetaItem}>
                        <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                        <Text style={[styles.tripMetaText, { color: colors.textMuted }]}>
                            {(item.actualDistance || item.plannedDistance || 0).toFixed(1)} km
                        </Text>
                    </View>
                    <View style={styles.tripMetaItem}>
                        <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                        <Text style={[styles.tripMetaText, { color: colors.textMuted }]}>
                            {formatDate(item.departureDatetime)}
                        </Text>
                    </View>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={[styles.emptyState, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceGlass }]}>
                <Ionicons name="time-outline" size={48} color={colors.primaryBlue} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Aucun trajet trouvé</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Les trajets apparaîtront ici une fois enregistrés
            </Text>
        </View>
    );

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
            <DashboardHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRefresh={onRefresh}
                isRefreshing={refreshing}
            />

            {/* Backend Offline Banner */}
            {!backendOnline && (
                <BackendOfflineBanner
                    message={backendError || undefined}
                    onRetry={onRefresh}
                    isRetrying={refreshing}
                />
            )}

            <View style={styles.header}>
                <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Historique</Text>
                <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
                    Consultez l'historique des trajets et incidents
                </Text>
            </View>

            {/* Stats Cards Row - Horizontal Scroll */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.statsScrollContent}
                style={styles.statsScrollView}
            >
                <StatsCard
                    icon="car-outline"
                    iconColor={colors.primaryBlue}
                    value={stats.totalTrips.toString()}
                    label="Total trajets"
                />
                <StatsCard
                    icon="location-outline"
                    iconColor={colors.successText}
                    value={`${stats.totalDistance.toFixed(1)} km`}
                    label="Distance totale"
                />
                <StatsCard
                    icon="checkmark-circle-outline"
                    iconColor={colors.primaryCyan}
                    value={stats.completedTrips.toString()}
                    label="Terminés"
                />
                <StatsCard
                    icon="time-outline"
                    iconColor={colors.warningText}
                    value={stats.inProgressTrips.toString()}
                    label="En cours"
                />
            </ScrollView>

            {/* Filters Row */}
            <View style={styles.filtersContainer}>
                <View style={styles.filterRow}>
                    <View style={styles.filterLabel}>
                        <Ionicons name="filter-outline" size={16} color={colors.textMuted} />
                        <Text style={[styles.filterLabelText, { color: colors.textMuted }]}>Filtrer:</Text>
                    </View>
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
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <FlatList
                data={filteredTrips}
                renderItem={renderTripItem}
                keyExtractor={(item) => item.tripId.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryBlue} />
                }
            />

            {/* Trip Details Modal */}
            <DataDetailsModal
                visible={isDetailsModalVisible}
                onClose={() => setIsDetailsModalVisible(false)}
                title="Détails du trajet"
                description={selectedTrip?.tripReference || `Trajet #${selectedTrip?.tripId}`}
                icon="time"
                data={[
                    { label: 'Référence', value: selectedTrip?.tripReference, icon: 'text-outline', fullWidth: true },
                    { label: 'Véhicule', value: selectedTrip?.vehicleRegistration, icon: 'car-outline' },
                    { label: 'Chauffeur', value: selectedTrip?.driverName, icon: 'person-outline' },
                    { label: 'Statut', value: selectedTrip ? getStatusLabel(selectedTrip.status) : '-', icon: 'flash-outline' },
                    { label: 'Distance prévue', value: selectedTrip?.plannedDistance ? `${selectedTrip.plannedDistance} km` : '-', icon: 'location-outline' },
                    { label: 'Distance réelle', value: selectedTrip?.actualDistance ? `${selectedTrip.actualDistance} km` : '-', icon: 'analytics-outline' },
                    { label: 'Date de départ', value: selectedTrip?.departureDatetime ? formatDate(selectedTrip.departureDatetime) : '-', icon: 'calendar-outline', fullWidth: true },
                    { label: 'Date d\'arrivée', value: selectedTrip?.arrivalDatetime ? formatDate(selectedTrip.arrivalDatetime) : '-', icon: 'calendar-outline', fullWidth: true },
                    { label: 'Notes', value: selectedTrip?.notes, icon: 'document-text-outline', fullWidth: true },
                    { label: 'ID Chauffeur', value: selectedTrip?.driverId, icon: 'id-card-outline' },
                    { label: 'ID Véhicule', value: selectedTrip?.vehicleId, icon: 'barcode-outline' },
                ]}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14 },
    header: { padding: 16, paddingTop: 8, paddingBottom: 12 },
    pageTitle: { fontSize: 24, fontWeight: '700' },
    pageSubtitle: { fontSize: 14, marginTop: 4 },

    // Stats Row - Horizontal Scroll
    statsScrollView: {
        flexGrow: 0,
        marginBottom: 16,
    },
    statsScrollContent: {
        paddingHorizontal: 16,
        gap: 12,
        paddingBottom: 4,
    },
    statsCard: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        paddingBottom: 16,
        borderRadius: 16,
        borderWidth: 1,
        minWidth: 110,
        width: width * 0.32,
        minHeight: 140,
    },
    statsIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    statsContent: {
        alignItems: 'center',
    },
    statsValue: {
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 28,
    },
    statsLabel: {
        fontSize: 11,
        marginTop: 4,
        textAlign: 'center',
        lineHeight: 14,
    },

    // Filters
    filtersContainer: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    filterLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    filterLabelText: {
        fontSize: 13,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    filterText: {
        fontSize: 12,
        fontWeight: '500',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        padding: 0,
    },

    // List
    listContent: {
        padding: 16,
        paddingTop: 8,
        paddingBottom: 100,
    },

    // Trip Card
    tripCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
        gap: 12,
    },
    tripIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tripContent: {
        flex: 1,
    },
    tripHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    tripReference: {
        fontSize: 15,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    tripDetails: {
        fontSize: 13,
        marginBottom: 6,
    },
    tripMeta: {
        flexDirection: 'row',
        gap: 16,
    },
    tripMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    tripMetaText: {
        fontSize: 11,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        borderRadius: 12,
        borderWidth: 1,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
});

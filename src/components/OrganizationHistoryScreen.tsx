/**
 * Historique organisation : trajets et incidents issus de la base.
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
    Dimensions,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { orgResourcesApi, type OrganizationTrip } from '../services/orgResourcesApi';
import type { Incident } from '../services/incidentApi';
import { DashboardHeader } from './DashboardHeader';
import { DataDetailsModal } from './DataDetailsModal';
import { BackendOfflineBanner } from './BackendOfflineBanner';

const { width } = Dimensions.get('window');

type FilterType = 'all' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'INCIDENT';

type HistoryKind = 'TRIP' | 'INCIDENT';

type HistoryEntry = {
    kind: HistoryKind;
    id: string;
    title: string;
    status: string;
    filterGroup: FilterType;
    occurredAt: string | null;
    vehicleRegistration?: string;
    driverName?: string;
    distanceKm: number;
    location?: string;
    returnLocation?: string;
    missionObject?: string;
    cancelReason?: string;
    endAt?: string | null;
    incidentType?: string;
    severity?: string;
    description?: string;
};

const tripDistance = (trip: OrganizationTrip): number => {
    const computed = Number(trip.computedDistanceKm ?? 0);
    if (Number.isFinite(computed) && computed > 0) return computed;
    const raw = Number(trip.distanceKm ?? 0);
    return Number.isFinite(raw) ? raw : 0;
};

const combineDateTime = (date?: string | null, time?: string | null): string | null => {
    if (!date) return null;
    const t = time && time.length >= 5 ? time : '00:00:00';
    return `${date}T${t}`;
};

const tripFilterGroup = (status?: string | null): FilterType => {
    switch ((status || '').toUpperCase()) {
        case 'COMPLETED':
            return 'COMPLETED';
        case 'CANCELLED':
            return 'CANCELLED';
        default:
            return 'IN_PROGRESS';
    }
};

const tripStatusLabel = (status?: string | null): string => {
    switch ((status || '').toUpperCase()) {
        case 'SCHEDULED':
            return 'Planifié';
        case 'DEPARTED':
            return 'En route';
        case 'RETURNING':
            return 'Retour';
        case 'COMPLETED':
            return 'Terminé';
        case 'CANCELLED':
            return 'Annulé';
        default:
            return status || '-';
    }
};

const incidentStatusLabel = (status?: string | null): string => {
    switch ((status || '').toUpperCase()) {
        case 'REPORTED':
            return 'Signalé';
        case 'UNDER_INVESTIGATION':
            return 'En enquête';
        case 'RESOLVED':
            return 'Résolu';
        case 'CLOSED':
            return 'Clôturé';
        default:
            return status || '-';
    }
};

const incidentTypeLabel = (type?: string | null): string => {
    switch ((type || '').toUpperCase()) {
        case 'ACCIDENT':
            return 'Accident';
        case 'BREAKDOWN':
            return 'Panne';
        case 'THEFT':
            return 'Vol';
        case 'VANDALISM':
            return 'Vandalisme';
        case 'TRAFFIC_VIOLATION':
            return 'Infraction';
        default:
            return type || 'Incident';
    }
};

const toTripEntry = (trip: OrganizationTrip): HistoryEntry => ({
    kind: 'TRIP',
    id: trip.id,
    title: trip.tripCode || 'Trajet',
    status: trip.status || '',
    filterGroup: tripFilterGroup(trip.status),
    occurredAt: combineDateTime(trip.startDate, trip.startTime),
    vehicleRegistration: trip.vehicleRegistration || undefined,
    driverName: trip.driverFullName || undefined,
    distanceKm: tripDistance(trip),
    location: trip.departureLocation || undefined,
    returnLocation: trip.returnLocation || undefined,
    missionObject: trip.missionObject || undefined,
    cancelReason: trip.cancelReason || undefined,
    endAt: combineDateTime(trip.endDate, trip.endTime),
});

const toIncidentEntry = (incident: Incident): HistoryEntry => ({
    kind: 'INCIDENT',
    id: incident.id,
    title: incidentTypeLabel(incident.type),
    status: incident.status,
    filterGroup: 'INCIDENT',
    occurredAt: incident.incidentDateTime || incident.createdAt || null,
    vehicleRegistration: incident.vehicleRegistration || undefined,
    driverName: incident.driverFullName || undefined,
    distanceKm: 0,
    incidentType: incident.type,
    severity: incident.severity,
    description: incident.description,
});

export default function OrganizationHistoryScreen() {
    const { t } = useTranslation();
    const { colors, isDarkMode } = useTheme();
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [entries, setEntries] = useState<HistoryEntry[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [backendOnline, setBackendOnline] = useState(true);
    const [backendError, setBackendError] = useState<string | null>(null);

    const FILTERS: { key: FilterType; label: string }[] = useMemo(() => [
        { key: 'all', label: 'Tous' },
        { key: 'IN_PROGRESS', label: 'En cours' },
        { key: 'COMPLETED', label: 'Terminé' },
        { key: 'CANCELLED', label: 'Annulé' },
        { key: 'INCIDENT', label: 'Incidents' },
    ], []);

    const fetchHistory = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            setBackendError(null);

            const [trips, incidents] = await Promise.all([
                orgResourcesApi.getTrips(),
                orgResourcesApi.getIncidents().catch(() => [] as Incident[]),
            ]);

            const mapped = [
                ...trips.map(toTripEntry),
                ...incidents.map(toIncidentEntry),
            ].sort((a, b) => {
                const da = a.occurredAt ? new Date(a.occurredAt).getTime() : 0;
                const db = b.occurredAt ? new Date(b.occurredAt).getTime() : 0;
                return db - da;
            });

            setBackendOnline(true);
            setEntries(mapped);
        } catch (error: any) {
            console.error('Error fetching history:', error);
            setBackendOnline(false);
            setBackendError(error.message || 'Erreur de connexion au serveur');
            setEntries([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchHistory(true);
    }, []);

    const trips = useMemo(() => entries.filter((e) => e.kind === 'TRIP'), [entries]);

    const stats = useMemo(() => {
        const totalDistance = trips.reduce((sum, trip) => sum + trip.distanceKm, 0);
        return {
            totalTrips: trips.length,
            totalDistance,
            completedTrips: trips.filter((t) => t.filterGroup === 'COMPLETED').length,
            inProgressTrips: trips.filter((t) => t.filterGroup === 'IN_PROGRESS').length,
        };
    }, [trips]);

    const filteredEntries = useMemo(() => {
        let filtered = entries;
        if (selectedFilter !== 'all') {
            filtered = filtered.filter((item) => item.filterGroup === selectedFilter);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((item) =>
                item.title.toLowerCase().includes(query)
                || item.driverName?.toLowerCase().includes(query)
                || item.vehicleRegistration?.toLowerCase().includes(query)
                || item.location?.toLowerCase().includes(query)
                || item.description?.toLowerCase().includes(query)
            );
        }
        return filtered;
    }, [entries, selectedFilter, searchQuery]);

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (item: HistoryEntry) => {
        if (item.kind === 'INCIDENT') return colors.warningText;
        switch (item.filterGroup) {
            case 'COMPLETED':
                return colors.successText;
            case 'IN_PROGRESS':
                return colors.primaryBlue;
            case 'CANCELLED':
                return colors.errorText;
            default:
                return colors.textSecondary;
        }
    };

    const getStatusLabel = (item: HistoryEntry) =>
        item.kind === 'INCIDENT' ? incidentStatusLabel(item.status) : tripStatusLabel(item.status);

    const StatsCard = ({
        icon,
        iconColor,
        value,
        label,
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

    const renderItem = ({ item }: { item: HistoryEntry }) => (
        <TouchableOpacity
            style={[styles.tripCard, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}
            activeOpacity={0.7}
            onPress={() => {
                setSelectedEntry(item);
                setIsDetailsModalVisible(true);
            }}
        >
            <View style={[styles.tripIconContainer, { backgroundColor: getStatusColor(item) + '20' }]}>
                <Ionicons
                    name={
                        item.kind === 'INCIDENT'
                            ? 'warning'
                            : item.filterGroup === 'COMPLETED'
                                ? 'checkmark-circle'
                                : item.filterGroup === 'IN_PROGRESS'
                                    ? 'navigate'
                                    : item.filterGroup === 'CANCELLED'
                                        ? 'close-circle'
                                        : 'time'
                    }
                    size={24}
                    color={getStatusColor(item)}
                />
            </View>
            <View style={styles.tripContent}>
                <View style={styles.tripHeader}>
                    <Text style={[styles.tripReference, { color: colors.textPrimary }]}>{item.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item) }]}>
                            {getStatusLabel(item)}
                        </Text>
                    </View>
                </View>
                <Text style={[styles.tripDetails, { color: colors.textSecondary }]}>
                    {item.vehicleRegistration || 'Véhicule non assigné'} • {item.driverName || 'Chauffeur non assigné'}
                </Text>
                <View style={styles.tripMeta}>
                    {item.kind === 'TRIP' ? (
                        <View style={styles.tripMetaItem}>
                            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                            <Text style={[styles.tripMetaText, { color: colors.textMuted }]}>
                                {item.distanceKm.toFixed(1)} km
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.tripMetaItem}>
                            <Ionicons name="alert-circle-outline" size={14} color={colors.textMuted} />
                            <Text style={[styles.tripMetaText, { color: colors.textMuted }]}>
                                {item.severity || 'Incident'}
                            </Text>
                        </View>
                    )}
                    <View style={styles.tripMetaItem}>
                        <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                        <Text style={[styles.tripMetaText, { color: colors.textMuted }]}>
                            {formatDate(item.occurredAt)}
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
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Aucun élément trouvé</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Les trajets et incidents de l'organisation apparaîtront ici
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

            <DashboardHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRefresh={() => fetchHistory(true)}
            />

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
                                    borderColor: colors.primaryBlue,
                                },
                            ]}
                            onPress={() => setSelectedFilter(filter.key)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    { color: colors.textSecondary },
                                    selectedFilter === filter.key && { color: colors.white },
                                ]}
                            >
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <FlatList
                data={filteredEntries}
                renderItem={renderItem}
                keyExtractor={(item) => `${item.kind}-${item.id}`}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryBlue} />
                }
            />

            <DataDetailsModal
                visible={isDetailsModalVisible}
                onClose={() => setIsDetailsModalVisible(false)}
                title={selectedEntry?.kind === 'INCIDENT' ? "Détails de l'incident" : 'Détails du trajet'}
                description={selectedEntry?.title}
                icon={selectedEntry?.kind === 'INCIDENT' ? 'warning' : 'time'}
                data={
                    selectedEntry?.kind === 'INCIDENT'
                        ? [
                            { label: 'Type', value: incidentTypeLabel(selectedEntry.incidentType), icon: 'alert-outline', fullWidth: true },
                            { label: 'Statut', value: incidentStatusLabel(selectedEntry.status), icon: 'flash-outline' },
                            { label: 'Gravité', value: selectedEntry.severity, icon: 'thermometer-outline' },
                            { label: 'Véhicule', value: selectedEntry.vehicleRegistration, icon: 'car-outline' },
                            { label: 'Chauffeur', value: selectedEntry.driverName, icon: 'person-outline' },
                            { label: 'Date', value: formatDate(selectedEntry.occurredAt), icon: 'calendar-outline', fullWidth: true },
                            { label: 'Description', value: selectedEntry.description, icon: 'document-text-outline', fullWidth: true },
                        ]
                        : [
                            { label: 'Référence', value: selectedEntry?.title, icon: 'text-outline', fullWidth: true },
                            { label: 'Véhicule', value: selectedEntry?.vehicleRegistration, icon: 'car-outline' },
                            { label: 'Chauffeur', value: selectedEntry?.driverName, icon: 'person-outline' },
                            { label: 'Statut', value: selectedEntry ? tripStatusLabel(selectedEntry.status) : '-', icon: 'flash-outline' },
                            { label: 'Distance', value: selectedEntry ? `${selectedEntry.distanceKm.toFixed(1)} km` : '-', icon: 'location-outline' },
                            { label: 'Départ', value: selectedEntry?.location, icon: 'navigate-outline', fullWidth: true },
                            { label: 'Retour', value: selectedEntry?.returnLocation, icon: 'flag-outline', fullWidth: true },
                            { label: 'Date de départ', value: formatDate(selectedEntry?.occurredAt), icon: 'calendar-outline', fullWidth: true },
                            { label: 'Date d\'arrivée', value: formatDate(selectedEntry?.endAt), icon: 'calendar-outline', fullWidth: true },
                            { label: 'Mission', value: selectedEntry?.missionObject, icon: 'briefcase-outline', fullWidth: true },
                            { label: 'Annulation', value: selectedEntry?.cancelReason, icon: 'close-circle-outline', fullWidth: true },
                        ]
                }
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
    statsScrollView: { flexGrow: 0, flexShrink: 0, marginBottom: 8 },
    statsScrollContent: { paddingHorizontal: 16, gap: 12, paddingVertical: 8, alignItems: 'stretch' },
    statsCard: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        minWidth: 110,
        width: width * 0.32,
        overflow: 'visible',
    },
    statsIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    statsContent: { alignItems: 'center' },
    statsValue: { fontSize: 20, fontWeight: '800', textAlign: 'center', lineHeight: 28 },
    statsLabel: { fontSize: 11, marginTop: 4, textAlign: 'center', lineHeight: 14 },
    filtersContainer: { paddingHorizontal: 16, marginBottom: 12 },
    filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
    filterLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    filterLabelText: { fontSize: 13 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
    filterText: { fontSize: 12, fontWeight: '500' },
    listContent: { padding: 16, paddingTop: 8, paddingBottom: 100 },
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
    tripContent: { flex: 1 },
    tripHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    tripReference: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: '600' },
    tripDetails: { fontSize: 13, marginBottom: 6 },
    tripMeta: { flexDirection: 'row', gap: 16 },
    tripMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    tripMetaText: { fontSize: 11 },
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
    emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
});

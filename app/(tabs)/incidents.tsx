/**
 * FleetMan Mobile - Incidents Screen
 * Incident management with interactive map and status filter
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    ActivityIndicator,
    Dimensions,
    Modal,
    Pressable,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { incidentApi, Incident, IncidentStatus } from '../../src/services';
import { FleetMap, VehicleMarker, DashboardHeader, ConfirmModal, BackendOfflineBanner } from '../../src/components';
import { checkBackendHealth } from '../../src/services/healthCheck';

const { height } = Dimensions.get('window');

// Status filter options
const STATUS_OPTIONS = [
    { value: 'ALL', label: 'Tous les statuts' },
    { value: 'REPORTED', label: 'Signalé' },
    { value: 'UNDER_INVESTIGATION', label: 'Sous enquête' },
    { value: 'RESOLVED', label: 'Résolu' },
    { value: 'CLOSED', label: 'Fermé' },
    { value: 'PENDING_INSURANCE', label: 'Attente assurance' },
];

export default function IncidentsScreen() {
    const { t } = useTranslation();
    const { colors, isDarkMode } = useTheme();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedIncident, setSelectedIncident] = useState<number | null>(null);
    const [showMap, setShowMap] = useState(false);

    // Status change states
    const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
    const [incidentToChangeStatus, setIncidentToChangeStatus] = useState<Incident | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Deletion states
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [incidentToDelete, setIncidentToDelete] = useState<Incident | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [backendOnline, setBackendOnline] = useState<boolean>(true);
    const [backendError, setBackendError] = useState<string | null>(null);

    const fetchIncidents = async () => {
        try {
            setError(null);
            setBackendError(null);

            const userStr = await AsyncStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const adminId = user?.adminId;

            const data = await incidentApi.getAll(adminId);

            // If we reach here, backend is online
            setBackendOnline(true);
            setBackendError(null);

            setIncidents(data);
            setFilteredIncidents(data);
        } catch (err: any) {
            console.error('Error fetching incidents:', err);
            setError(err.message || t('common.error'));
            setBackendOnline(false);
            setBackendError(err.message || 'Erreur de connexion au serveur');
            // Clear data when backend is offline
            setIncidents([]);
            setFilteredIncidents([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, []);

    // Filter incidents by search query and status
    useEffect(() => {
        let filtered = incidents;

        // Apply status filter
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(i => i.status === statusFilter);
        }

        // Apply search filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(i => {
                const desc = (i.description || '').toLowerCase();
                const type = (i.type || '').toLowerCase();
                return desc.includes(query) || type.includes(query);
            });
        }

        setFilteredIncidents(filtered);
    }, [searchQuery, statusFilter, incidents]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchIncidents();
    }, []);

    // Convert incidents to map markers
    const incidentMarkers: VehicleMarker[] = useMemo(() => {
        return filteredIncidents
            .filter(i => i.latitude && i.longitude)
            .map(i => ({
                id: i.id,
                name: getTypeLabel(i.type),
                latitude: i.latitude,
                longitude: i.longitude,
                status: i.severity === 'CRITICAL' || i.severity === 'HIGH'
                    ? 'stopped'
                    : i.severity === 'MEDIUM'
                        ? 'idle'
                        : 'moving',
            }));
    }, [filteredIncidents]);

    const handleMarkerPress = (marker: VehicleMarker) => {
        setSelectedIncident(marker.id);
        setShowMap(false);
    };

    // Handle status change
    const handleStatusChange = async (newStatus: IncidentStatus) => {
        if (!incidentToChangeStatus) return;

        setUpdatingStatus(true);
        try {
            const updatedIncident = await incidentApi.updateStatus(incidentToChangeStatus.incidentId, newStatus);

            // Update local state
            setIncidents(prev =>
                prev.map(inc =>
                    inc.incidentId === updatedIncident.incidentId ? updatedIncident : inc
                )
            );

            setShowChangeStatusModal(false);
            setIncidentToChangeStatus(null);

            Alert.alert(
                'Succès',
                `Le statut a été modifié en "${getStatusLabel(newStatus)}"`,
                [{ text: 'OK' }]
            );
        } catch (err: any) {
            console.error('Error updating incident status:', err);
            Alert.alert(
                'Erreur',
                err.message || 'Impossible de modifier le statut',
                [{ text: 'OK' }]
            );
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Handle incident deletion
    const handleDeleteIncident = (incident: Incident) => {
        setIncidentToDelete(incident);
        setIsDeleteModalVisible(true);
    };

    const confirmDeleteIncident = async () => {
        if (!incidentToDelete) return;

        try {
            setIsDeleting(true);
            await incidentApi.delete(incidentToDelete.incidentId);
            setIsDeleteModalVisible(false);
            setIncidentToDelete(null);
            fetchIncidents(); // Refresh the list
            Alert.alert('Succès', 'L\'incident a été supprimé avec succès.');
        } catch (err: any) {
            console.error('Error deleting incident:', err);
            Alert.alert('Erreur', err.message || 'Impossible de supprimer l\'incident.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Open status change modal
    const openChangeStatusModal = (incident: Incident) => {
        setIncidentToChangeStatus(incident);
        setShowChangeStatusModal(true);
    };

    const getSeverityColor = (severity: string) => {
        const severities: Record<string, string> = {
            'MINOR': colors.successText,
            'LOW': colors.successText,
            'MODERATE': colors.warningText || '#f59e0b',
            'MEDIUM': colors.warningText || '#f59e0b',
            'MAJOR': '#f97316',
            'HIGH': '#f97316',
            'CRITICAL': colors.errorText,
        };
        return severities[severity] || colors.textMuted;
    };

    const getStatusColor = (status: string) => {
        const statuses: Record<string, string> = {
            'REPORTED': colors.warningText || '#f59e0b',
            'UNDER_INVESTIGATION': colors.primaryBlue,
            'RESOLVED': colors.successText,
            'CLOSED': colors.textMuted,
            'PENDING_INSURANCE': '#8b5cf6', // Violet
        };
        return statuses[status] || colors.textMuted;
    };

    const getTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
        const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            'ACCIDENT': 'car-sport',
            'BREAKDOWN': 'construct',
            'TRAFFIC_VIOLATION': 'speedometer',
            'VANDALISM': 'hammer',
            'THEFT': 'lock-open',
            'WEATHER': 'thunderstorm',
            'OTHER': 'alert-circle',
        };
        return icons[type] || 'alert-circle';
    };

    function getTypeLabel(type: string) {
        return t(`incidents.type.${type}`) || type;
    }

    const getSeverityLabel = (severity: string) => {
        return t(`incidents.severity.${severity}`) || severity;
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'REPORTED': 'Signalé',
            'UNDER_INVESTIGATION': 'Sous enquête',
            'RESOLVED': 'Résolu',
            'CLOSED': 'Fermé',
            'PENDING_INSURANCE': 'Attente assurance',
            'ALL': 'Tous les statuts'
        };
        return labels[status] || status;
    };

    const getSelectedStatusLabel = () => {
        const option = STATUS_OPTIONS.find(o => o.value === statusFilter);
        return option?.label || 'Tous les statuts';
    };

    const renderIncidentCard = ({ item }: { item: Incident }) => (
        <TouchableOpacity
            style={[styles.card, {
                backgroundColor: colors.surfaceCard,
                borderColor: selectedIncident === item.incidentId ? colors.primaryBlue : colors.borderGlass,
                borderLeftWidth: 4,
                borderLeftColor: getSeverityColor(item.incidentSeverity),
                borderWidth: selectedIncident === item.incidentId ? 2 : 1,
            }]}
            activeOpacity={0.7}
            onPress={() => setSelectedIncident(selectedIncident === item.incidentId ? null : item.incidentId)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.incidentIcon, { backgroundColor: getSeverityColor(item.incidentSeverity) + '20' }]}>
                    <Ionicons name={getTypeIcon(item.incidentType)} size={24} color={getSeverityColor(item.incidentSeverity)} />
                </View>
                <View style={styles.cardInfo}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.cardTitle, { color: colors.textPrimary, textTransform: 'uppercase' }]}>
                            {getTypeLabel(item.incidentType)}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.incidentStatus) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(item.incidentStatus), fontWeight: '800' }]}>
                                {getStatusLabel(item.incidentStatus).toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.incidentSeverity) + '20' }]}>
                        <Text style={[styles.severityText, { color: getSeverityColor(item.incidentSeverity) }]}>
                            {getSeverityLabel(item.incidentSeverity)}
                        </Text>
                    </View>
                </View>
            </View>

            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.incidentDescription}
            </Text>

            <View style={[styles.cardFooter, { borderTopColor: colors.borderGlass }]}>
                <View style={styles.footerItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                    <Text style={[styles.footerText, { color: colors.textMuted }]}>
                        {new Date(item.incidentDateTime || item.createdAt).toLocaleDateString()}
                    </Text>
                </View>
                <View style={styles.footerActions}>
                    {item.incidentLatitude && item.incidentLongitude && (
                        <View style={styles.footerItem}>
                            <Ionicons name="location-outline" size={14} color={colors.primaryBlue} />
                            <Text style={[styles.footerText, { color: colors.primaryBlue }]}>
                                Carte
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={[styles.changeStatusButton, { backgroundColor: colors.primaryBlue + '15', borderColor: colors.primaryBlue }]}
                        onPress={(e) => {
                            e.stopPropagation();
                            openChangeStatusModal(item);
                        }}
                    >
                        <Ionicons name="swap-horizontal" size={14} color={colors.primaryBlue} />
                        <Text style={[styles.changeStatusText, { color: colors.primaryBlue }]}>
                            Statut
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.deleteButton, { backgroundColor: colors.errorBg + '20', borderColor: colors.errorText }]}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteIncident(item);
                        }}
                    >
                        <Ionicons name="trash-outline" size={14} color={colors.errorText} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={[styles.emptyState, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceGlass }]}>
                <Ionicons name="shield-checkmark-outline" size={48} color={colors.successText} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Aucun incident</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Aucun incident signalé</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.primaryDark }]}>
                <ActivityIndicator size="large" color={colors.primaryBlue} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('common.loading')}</Text>
            </View>
        );
    }

    const incidentsWithLocation = incidents.filter(i => i.latitude && i.longitude).length;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryDark }]} edges={['top']}>
            {isDarkMode && (
                <LinearGradient
                    colors={[colors.primaryDark, '#0f172a', colors.primaryDark]}
                    style={StyleSheet.absoluteFillObject}
                />
            )}

            {/* Header */}
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

            {/* Page Header with Title and Filter */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Incidents</Text>
                        <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
                            Suivi des incidents et alertes
                        </Text>
                    </View>
                    <View style={styles.headerButtons}>
                        {/* Status Filter Dropdown Button */}
                        <TouchableOpacity
                            style={[styles.filterButton, {
                                backgroundColor: colors.surfaceCard,
                                borderColor: colors.borderGlass
                            }]}
                            onPress={() => setShowStatusDropdown(true)}
                        >
                            <Ionicons name="filter-outline" size={18} color={colors.textMuted} />
                            <Text style={[styles.filterButtonText, { color: colors.textPrimary }]}>
                                {getSelectedStatusLabel()}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
                        </TouchableOpacity>

                        {incidentsWithLocation > 0 && (
                            <TouchableOpacity
                                style={[styles.mapToggle, {
                                    backgroundColor: showMap ? colors.primaryBlue : colors.surfaceGlass
                                }]}
                                onPress={() => setShowMap(!showMap)}
                            >
                                <Ionicons
                                    name={showMap ? 'list' : 'map'}
                                    size={18}
                                    color={showMap ? colors.white : colors.primaryBlue}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* Status Filter Dropdown Modal */}
            <Modal
                visible={showStatusDropdown}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowStatusDropdown(false)}
            >
                <Pressable
                    style={styles.dropdownOverlay}
                    onPress={() => setShowStatusDropdown(false)}
                >
                    <Pressable
                        style={[styles.dropdownContainer, {
                            backgroundColor: colors.surfaceCard,
                            borderColor: colors.borderGlass
                        }]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text style={[styles.dropdownTitle, { color: colors.textPrimary }]}>
                            Filtrer par statut
                        </Text>
                        {STATUS_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.dropdownOption,
                                    statusFilter === option.value && {
                                        backgroundColor: colors.primaryBlue + '20'
                                    }
                                ]}
                                onPress={() => {
                                    setStatusFilter(option.value);
                                    setShowStatusDropdown(false);
                                }}
                            >
                                <Text style={[
                                    styles.dropdownOptionText,
                                    { color: colors.textPrimary },
                                    statusFilter === option.value && {
                                        color: colors.primaryBlue,
                                        fontWeight: '600'
                                    }
                                ]}>
                                    {option.label}
                                </Text>
                                {statusFilter === option.value && (
                                    <Ionicons name="checkmark" size={20} color={colors.primaryBlue} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Status Change Modal */}
            <Modal
                visible={showChangeStatusModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                    if (!updatingStatus) {
                        setShowChangeStatusModal(false);
                        setIncidentToChangeStatus(null);
                    }
                }}
            >
                <Pressable
                    style={styles.dropdownOverlay}
                    onPress={() => {
                        if (!updatingStatus) {
                            setShowChangeStatusModal(false);
                            setIncidentToChangeStatus(null);
                        }
                    }}
                >
                    <Pressable
                        style={[styles.dropdownContainer, {
                            backgroundColor: colors.surfaceCard,
                            borderColor: colors.borderGlass
                        }]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text style={[styles.dropdownTitle, { color: colors.textPrimary, borderBottomColor: colors.borderGlass }]}>
                            Modifier le statut
                        </Text>

                        {incidentToChangeStatus && (
                            <View style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.surfaceGlass }}>
                                <Text style={{ fontSize: 12, color: colors.textMuted }}>
                                    Incident: {getTypeLabel(incidentToChangeStatus.incidentType)}
                                </Text>
                                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                                    Statut actuel: {getStatusLabel(incidentToChangeStatus.incidentStatus)}
                                </Text>
                            </View>
                        )}

                        {updatingStatus ? (
                            <View style={styles.statusModalLoading}>
                                <ActivityIndicator size="large" color={colors.primaryBlue} />
                                <Text style={{ color: colors.textSecondary, marginTop: 10 }}>
                                    Mise à jour en cours...
                                </Text>
                            </View>
                        ) : (
                            STATUS_OPTIONS.filter(opt => opt.value !== 'ALL').map((option) => {
                                const isCurrentStatus = incidentToChangeStatus?.incidentStatus === option.value;
                                return (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.statusModalOption,
                                            isCurrentStatus && { backgroundColor: colors.primaryBlue + '10' }
                                        ]}
                                        disabled={isCurrentStatus}
                                        onPress={() => handleStatusChange(option.value as IncidentStatus)}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <View style={[
                                                { width: 10, height: 10, borderRadius: 5 },
                                                { backgroundColor: getStatusColor(option.value) }
                                            ]} />
                                            <Text style={[
                                                styles.statusModalOptionText,
                                                { color: isCurrentStatus ? colors.textMuted : colors.textPrimary },
                                            ]}>
                                                {option.label}
                                            </Text>
                                        </View>
                                        {isCurrentStatus ? (
                                            <View style={[styles.statusModalCurrentBadge, { backgroundColor: colors.primaryBlue + '20' }]}>
                                                <Text style={[styles.statusModalCurrentText, { color: colors.primaryBlue }]}>
                                                    ACTUEL
                                                </Text>
                                            </View>
                                        ) : (
                                            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })
                        )}

                        <TouchableOpacity
                            style={{
                                padding: 16,
                                alignItems: 'center',
                                borderTopWidth: 1,
                                borderTopColor: colors.borderGlass
                            }}
                            onPress={() => {
                                setShowChangeStatusModal(false);
                                setIncidentToChangeStatus(null);
                            }}
                            disabled={updatingStatus}
                        >
                            <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>
                                Annuler
                            </Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>

            {error && (
                <View style={[styles.errorContainer, {
                    backgroundColor: colors.errorBg,
                    borderColor: colors.errorBorder
                }]}>
                    <Ionicons name="alert-circle" size={20} color={colors.errorText} />
                    <Text style={[styles.errorTextStyle, { color: colors.errorText }]}>{error}</Text>
                </View>
            )}

            {/* Active Filter Badge */}
            {statusFilter !== 'ALL' && (
                <View style={styles.activeFilterContainer}>
                    <View style={[styles.activeFilterBadge, { backgroundColor: colors.primaryBlue + '20' }]}>
                        <Text style={[styles.activeFilterText, { color: colors.primaryBlue }]}>
                            {getSelectedStatusLabel()}
                        </Text>
                        <TouchableOpacity onPress={() => setStatusFilter('ALL')}>
                            <Ionicons name="close-circle" size={18} color={colors.primaryBlue} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Map View */}
            {showMap && incidentMarkers.length > 0 && (
                <View style={[styles.mapContainer, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                    <FleetMap
                        vehicles={incidentMarkers}
                        selectedVehicleId={selectedIncident}
                        onVehiclePress={handleMarkerPress}
                    />
                    <View style={[styles.mapLegend, { backgroundColor: colors.surfaceCard + 'E6' }]}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: colors.errorText }]} />
                            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Critique/Élevé</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: colors.warningText }]} />
                            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Moyen</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: colors.successText }]} />
                            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Faible</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Deletion Confirmation Modal */}
            <ConfirmModal
                visible={isDeleteModalVisible}
                onClose={() => {
                    setIsDeleteModalVisible(false);
                    setIncidentToDelete(null);
                }}
                onConfirm={confirmDeleteIncident}
                title="Supprimer l'incident"
                message={`Voulez-vous vraiment supprimer l'incident "${incidentToDelete?.incidentTitle || incidentToDelete?.incidentType}" ? Cette action est irréversible.`}
                confirmText="Supprimer"
                cancelText="Annuler"
                type="danger"
                icon="trash"
                requireTextConfirmation={true}
                confirmationText={incidentToDelete?.incidentTitle || incidentToDelete?.incidentType || ''}
            />

            {/* Incident List */}
            <FlatList
                data={filteredIncidents}
                renderItem={renderIncidentCard}
                keyExtractor={(item) => item.incidentId.toString()}
                contentContainerStyle={[styles.listContent, showMap && { paddingTop: 8 }]}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primaryBlue}
                    />
                }
                showsVerticalScrollIndicator={false}
                style={showMap ? { maxHeight: height * 0.35 } : undefined}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14 },
    header: { padding: 16, paddingTop: 8 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    headerButtons: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    mapToggle: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    pageTitle: { fontSize: 24, fontWeight: '700' },
    pageSubtitle: { fontSize: 14, marginTop: 4 },

    // Filter Button
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        gap: 8,
    },
    filterButtonText: { fontSize: 14 },

    // Dropdown Modal
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dropdownContainer: {
        width: '90%',
        maxWidth: 340,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    dropdownTitle: {
        fontSize: 16,
        fontWeight: '600',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    dropdownOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    dropdownOptionText: { fontSize: 15 },

    // Active Filter Badge
    activeFilterContainer: { paddingHorizontal: 16, marginBottom: 8 },
    activeFilterBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    activeFilterText: { fontSize: 13, fontWeight: '500' },

    errorContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, marginHorizontal: 16, marginBottom: 8, borderRadius: 8, borderWidth: 1, gap: 8 },
    errorTextStyle: { fontSize: 14, flex: 1 },
    mapContainer: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1, overflow: 'hidden', height: height * 0.28 },
    mapLegend: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', paddingVertical: 8, gap: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 11 },
    listContent: { padding: 16, paddingTop: 0 },
    card: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1 },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    incidentIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    cardInfo: { flex: 1, marginLeft: 12 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    cardTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: '600' },
    severityBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    severityText: { fontSize: 11, fontWeight: '600' },
    description: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
    cardFooter: { paddingTop: 12, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    footerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    footerText: { fontSize: 12 },
    changeStatusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1
    },
    changeStatusText: { fontSize: 12, fontWeight: '600' },
    deleteButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1
    },
    emptyState: { alignItems: 'center', paddingVertical: 60, borderRadius: 12, borderWidth: 1 },
    emptyIcon: { width: 80, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    emptySubtitle: { fontSize: 14 },

    // Status Change Modal Styles
    statusModalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    statusModalOptionText: { fontSize: 15 },
    statusModalCurrentBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusModalCurrentText: { fontSize: 10, fontWeight: '600' },
    statusModalLoading: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});

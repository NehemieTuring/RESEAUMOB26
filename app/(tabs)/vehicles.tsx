/**
 * FleetMan Mobile - Vehicles Screen (Responsive Design)
 * Uses card-based layout for better mobile experience
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    ActivityIndicator,
    Modal,
    Pressable,
    Alert,
    Dimensions,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { vehicleApi, Vehicle } from '../../src/services';
import {
    DashboardHeader,
    ConfirmModal,
    DataDetailsModal,
    BackendOfflineBanner,
    ResponsiveDataCard,
    ResponsivePageHeader,
} from '../../src/components';
import CreateVehicleModal from '../../src/components/CreateVehicleModal';
import { UpdateVehicleModal } from '../../src/components/UpdateVehicleModal';
import { checkBackendHealth } from '../../src/services/healthCheck';

const { width: screenWidth } = Dimensions.get('window');

const STATE_OPTIONS = [
    { value: 'ALL', label: 'Tous les états' },
    { value: 'IN_SERVICE', label: 'En service' },
    { value: 'IN_ALARM', label: 'En alerte' },
    { value: 'UNDER_MAINTENANCE', label: 'En maintenance' },
    { value: 'PARKED', label: 'Garé' },
    { value: 'OUT_OF_SERVICE', label: 'Hors service' },
];

export default function VehiclesScreen() {
    const { t } = useTranslation();
    const { colors, isDarkMode } = useTheme();
    const params = useLocalSearchParams();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState((params.search as string) || '');
    const [stateFilter, setStateFilter] = useState<string>('ALL');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [backendOnline, setBackendOnline] = useState<boolean>(true);
    const [backendError, setBackendError] = useState<string | null>(null);

    const fetchVehicles = async () => {
        try {
            setError(null);
            setBackendError(null);

            const userStr = await AsyncStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const adminId = user?.adminId;

            const data = await vehicleApi.getAll(adminId);

            // If we reach here, backend is online
            setBackendOnline(true);
            setBackendError(null);

            setVehicles(data);
            setFilteredVehicles(data);
        } catch (err: any) {
            console.error('Error fetching vehicles:', err);
            setError(err.message || t('common.error'));
            setBackendOnline(false);
            setBackendError(err.message || 'Erreur de connexion au serveur');
            // Clear data when backend is offline
            setVehicles([]);
            setFilteredVehicles([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    useEffect(() => {
        let filtered = vehicles;

        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(v => {
                const makeModel = `${v.vehicleMake} ${v.vehicleModel}`.toLowerCase();
                const vin = (v.vehicleIdentificationNumber || '').toLowerCase();
                const plate = (v.vehicleRegistrationNumber || '').toLowerCase();
                return makeModel.includes(query) || vin.includes(query) || plate.includes(query);
            });
        }

        if (stateFilter !== 'ALL') {
            filtered = filtered.filter(v => v.state === stateFilter);
        }

        setFilteredVehicles(filtered);
    }, [searchQuery, stateFilter, vehicles]);

    useEffect(() => {
        if (params.registration && vehicles.length > 0) {
            const vehicle = vehicles.find(v => v.vehicleRegistrationNumber === params.registration);
            if (vehicle) {
                handleShowDetails(vehicle);
            }
        }
    }, [params.registration, vehicles]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchVehicles();
    }, []);

    const handleEditVehicle = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setShowEditModal(true);
    };

    const handleDeleteVehicle = (vehicle: Vehicle) => {
        setVehicleToDelete(vehicle);
        setIsDeleteModalVisible(true);
    };

    const confirmDeleteVehicle = async () => {
        if (!vehicleToDelete) return;
        try {
            setLoading(true);
            await vehicleApi.delete(vehicleToDelete.vehicleId);
            Alert.alert(t('common.success'), t('vehicles.deleteSuccess'));
            fetchVehicles();
        } catch (err: any) {
            Alert.alert(t('common.error'), err.message || t('vehicles.deleteError'));
        } finally {
            setLoading(false);
            setIsDeleteModalVisible(false);
            setVehicleToDelete(null);
        }
    };

    const getSelectedFilterLabel = () => {
        const option = STATE_OPTIONS.find(o => o.value === stateFilter);
        return option?.label || 'Tous les états';
    };

    const getVehicleStateStyle = (state: string) => {
        switch (state) {
            case 'IN_SERVICE':
                return { bg: '#dcfce7', text: '#16a34a', label: 'En service' };
            case 'PARKED':
                return { bg: '#eff6ff', text: '#3b82f6', label: 'Garé' };
            case 'IN_ALARM':
                return { bg: '#fee2e2', text: '#ef4444', label: 'En alerte' };
            case 'UNDER_MAINTENANCE':
            case 'MAINTENANCE':
                return { bg: '#fef3c7', text: '#d97706', label: 'Maintenance' };
            case 'OUT_OF_SERVICE':
            case 'OUT_OF_ORDER':
                return { bg: '#f1f5f9', text: '#475569', label: 'Hors service' };
            default:
                return { bg: '#f1f5f9', text: '#64748b', label: state };
        }
    };

    const handleShowDetails = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setIsDetailsModalVisible(true);
    };

    const renderVehicleCard = ({ item }: { item: Vehicle }) => {
        const stateStyle = getVehicleStateStyle(item.state || 'IN_SERVICE');

        return (
            <ResponsiveDataCard
                title={`${item.vehicleMake} ${item.vehicleModel}`}
                subtitle={`VIN: ${item.vehicleIdentificationNumber || '-'}`}
                avatar={{
                    icon: 'car',
                    color: colors.primaryBlue,
                    bgColor: colors.infoBg,
                }}
                badge={{
                    text: stateStyle.label,
                    color: stateStyle.text,
                    bgColor: stateStyle.bg,
                }}
                fields={[
                    { label: 'Immatriculation', value: item.vehicleRegistrationNumber, icon: 'card-outline', highlight: true },
                    { label: 'Type', value: item.type, icon: 'list-outline' },
                    { label: 'Carburant', value: `${item.fuelLevel || 0}%`, icon: 'water-outline' },
                    { label: 'Type carbu.', value: item.fuelType || '-', icon: 'flame-outline' },
                ]}
                actions={[
                    { icon: 'eye-outline', label: 'Voir', onPress: () => handleShowDetails(item), color: colors.primaryBlue },
                    { icon: 'create-outline', onPress: () => handleEditVehicle(item), color: colors.textSecondary },
                    { icon: 'trash-outline', onPress: () => handleDeleteVehicle(item), color: colors.errorBorder },
                ]}
                onPress={() => handleShowDetails(item)}
            />
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.primaryDark }]}>
                <ActivityIndicator size="large" color={colors.primaryBlue} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('common.loading')}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryDark }]} edges={['top']}>
            <DashboardHeader showSearch={false} onRefresh={onRefresh} isRefreshing={refreshing} />

            {/* Backend Offline Banner */}
            {!backendOnline && (
                <BackendOfflineBanner
                    message={backendError || undefined}
                    onRetry={onRefresh}
                    isRetrying={refreshing}
                />
            )}

            {/* Responsive Page Header */}
            <ResponsivePageHeader
                title="Mes Véhicules"
                subtitle="Gérez votre flotte automobile"
                actionLabel="Nouveau"
                actionIcon="add"
                onActionPress={() => setShowCreateModal(true)}
            />

            {/* Search and Filter Row - Horizontal Scrollable */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScrollContent}
                style={styles.filterScrollView}
            >
                <View style={[styles.searchContainer, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                    <Ionicons name="search" size={18} color={colors.textMuted} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.textPrimary }]}
                        placeholder="Rechercher..."
                        placeholderTextColor={colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.filterButton, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}
                    onPress={() => setShowFilterModal(true)}
                >
                    <Ionicons name="options-outline" size={18} color={colors.textSecondary} />
                    <Text style={[styles.filterText, { color: colors.textSecondary }]} numberOfLines={1}>
                        {getSelectedFilterLabel()}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
                </TouchableOpacity>
            </ScrollView>

            {/* Results Count */}
            <View style={styles.resultsContainer}>
                <Text style={[styles.resultsText, { color: colors.textMuted }]}>
                    {filteredVehicles.length} véhicule{filteredVehicles.length !== 1 ? 's' : ''} trouvé{filteredVehicles.length !== 1 ? 's' : ''}
                </Text>
            </View>

            {/* Filter Modal */}
            <Modal
                visible={showFilterModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowFilterModal(false)}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surfaceCard }]}>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Filtrer par état</Text>
                        {STATE_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.optionButton,
                                    { borderBottomColor: colors.borderGlass },
                                    stateFilter === option.value && { backgroundColor: colors.infoBg }
                                ]}
                                onPress={() => {
                                    setStateFilter(option.value);
                                    setShowFilterModal(false);
                                }}
                            >
                                <Text style={[
                                    styles.optionText,
                                    { color: colors.textSecondary },
                                    stateFilter === option.value && { color: colors.primaryBlue, fontWeight: '600' }
                                ]}>
                                    {option.label}
                                </Text>
                                {stateFilter === option.value && (
                                    <Ionicons name="checkmark" size={20} color={colors.primaryBlue} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>

            {error && (
                <View style={[styles.errorContainer, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }]}>
                    <Ionicons name="alert-circle" size={20} color={colors.errorBorder} />
                    <Text style={[styles.errorText, { color: colors.errorText }]}>{error}</Text>
                </View>
            )}

            {/* Vehicle Cards List */}
            <FlatList
                data={filteredVehicles}
                renderItem={renderVehicleCard}
                keyExtractor={(item) => item.vehicleId.toString()}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIcon, { backgroundColor: colors.infoBg }]}>
                            <Ionicons name="car-outline" size={48} color={colors.primaryBlue} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Aucun véhicule</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Enregistrez votre premier véhicule</Text>
                    </View>
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primaryBlue}
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.listContent,
                    filteredVehicles.length === 0 && { flex: 1 }
                ]}
            />

            {/* Create Vehicle Modal */}
            <CreateVehicleModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                    fetchVehicles();
                }}
            />

            {/* Update Vehicle Modal */}
            <UpdateVehicleModal
                visible={showEditModal}
                vehicle={selectedVehicle}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedVehicle(null);
                }}
                onSuccess={() => {
                    setShowEditModal(false);
                    setSelectedVehicle(null);
                    fetchVehicles();
                }}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                visible={isDeleteModalVisible}
                onClose={() => {
                    setIsDeleteModalVisible(false);
                    setVehicleToDelete(null);
                }}
                onConfirm={confirmDeleteVehicle}
                title="Supprimer le véhicule"
                message={`Voulez-vous vraiment supprimer le véhicule ${vehicleToDelete?.vehicleMake} ${vehicleToDelete?.vehicleModel} ? Cette action est irréversible.`}
                confirmText="Supprimer"
                cancelText="Annuler"
                type="danger"
                icon="trash"
                requireTextConfirmation={true}
                confirmationText={vehicleToDelete ? `${vehicleToDelete.vehicleMake} ${vehicleToDelete.vehicleModel}` : ''}
            />

            {/* Vehicle Details Modal */}
            <DataDetailsModal
                visible={isDetailsModalVisible}
                onClose={() => setIsDetailsModalVisible(false)}
                title="Détails du véhicule"
                description={`${selectedVehicle?.vehicleMake} ${selectedVehicle?.vehicleModel}`}
                icon="car"
                data={[
                    { label: 'Marque', value: selectedVehicle?.vehicleMake, icon: 'business-outline' },
                    { label: 'Modèle', value: selectedVehicle?.vehicleModel, icon: 'car-sport-outline' },
                    { label: 'Immatriculation', value: selectedVehicle?.vehicleRegistrationNumber, icon: 'card-outline' },
                    { label: 'Type', value: selectedVehicle?.type, icon: 'list-outline' },
                    { label: 'N° de Châssis (VIN)', value: selectedVehicle?.vehicleIdentificationNumber, icon: 'barcode-outline', fullWidth: true },
                    { label: 'Appareil Connecté ID', value: selectedVehicle?.vehicleDeviceIdAddress, icon: 'hardware-chip-outline', fullWidth: true },
                    { label: 'État Actuel', value: selectedVehicle?.state, icon: 'flash-outline' },
                    { label: 'Type de Carburant', value: selectedVehicle?.fuelType, icon: 'water-outline' },
                    { label: 'Niveau Carburant', value: `${selectedVehicle?.fuelLevel || 0}%`, icon: 'speedometer-outline' },
                    { label: 'Passagers', value: selectedVehicle?.numberOfPassengers, icon: 'people-outline' },
                    { label: 'Vitesse Actuelle', value: `${selectedVehicle?.speed || 0} km/h`, icon: 'stats-chart-outline' },
                    { label: 'Date d\'ajout', value: selectedVehicle?.createdAt ? new Date(selectedVehicle.createdAt).toLocaleDateString() : '-', icon: 'calendar-outline' },
                ]}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    filterScrollView: {
        flexGrow: 0,
        marginBottom: 8,
    },
    filterScrollContent: {
        paddingHorizontal: 16,
        gap: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
        minWidth: 180,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        minWidth: 100,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        gap: 6,
    },
    filterText: {
        fontSize: 13,
    },
    resultsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    resultsText: {
        fontSize: 12,
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 20,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        gap: 8,
    },
    errorText: {
        fontSize: 14,
        flex: 1,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '90%',
        maxWidth: 400,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    optionButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    optionText: {
        fontSize: 15,
    },
});

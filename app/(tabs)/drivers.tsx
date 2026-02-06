/**
 * FleetMan Mobile - Drivers Screen (Responsive Design)
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
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { driverApi, Driver } from '../../src/services';
import {
    DashboardHeader,
    ConfirmModal,
    DataDetailsModal,
    BackendOfflineBanner,
    ResponsiveDataCard,
    ResponsivePageHeader,
} from '../../src/components';
import { UpdateDriverModal } from '../../src/components/UpdateDriverModal';
import CreateDriverModal from '../../src/components/CreateDriverModal';
import { checkBackendHealth } from '../../src/services/healthCheck';

const STATE_OPTIONS = [
    { value: 'ALL', label: 'Tous les états' },
    { value: 'ACTIVE', label: 'Actif' },
    { value: 'INACTIVE', label: 'Inactif' },
    { value: 'ON_LEAVE', label: 'En congé' },
    { value: 'SUSPENDED', label: 'Suspendu' },
];

export default function DriversScreen() {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const params = useLocalSearchParams();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState((params.search as string) || '');
    const [stateFilter, setStateFilter] = useState<string>('ALL');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [backendOnline, setBackendOnline] = useState<boolean>(true);
    const [backendError, setBackendError] = useState<string | null>(null);

    const fetchDrivers = async () => {
        try {
            setError(null);
            setBackendError(null);

            const userStr = await AsyncStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const adminId = user?.adminId;

            const data = await driverApi.getAll(adminId);

            // If we reach here, backend is online
            setBackendOnline(true);
            setBackendError(null);

            setDrivers(data);
            setFilteredDrivers(data);
        } catch (err: any) {
            console.error('Error fetching drivers:', err);
            setError(err.message || t('common.error'));
            setBackendOnline(false);
            setBackendError(err.message || 'Erreur de connexion au serveur');
            // Clear data when backend is offline
            setDrivers([]);
            setFilteredDrivers([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    useEffect(() => {
        let filtered = drivers;

        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(d => {
                const name = `${d.driverFirstName} ${d.driverLastName}`.toLowerCase();
                const email = (d.driverEmail || '').toLowerCase();
                const phone = (d.driverPhoneNumber || '').toLowerCase();
                return name.includes(query) || email.includes(query) || phone.includes(query);
            });
        }

        if (stateFilter !== 'ALL') {
            filtered = filtered.filter(d => d.driverStatus === stateFilter);
        }

        setFilteredDrivers(filtered);
    }, [searchQuery, stateFilter, drivers]);

    const handleEditDriver = (driver: Driver) => {
        setSelectedDriver(driver);
        setIsEditModalVisible(true);
    };

    const handleDeleteDriver = (driver: Driver) => {
        setDriverToDelete(driver);
        setIsDeleteModalVisible(true);
    };

    const confirmDeleteDriver = async () => {
        if (!driverToDelete) return;
        try {
            setLoading(true);
            await driverApi.delete(driverToDelete.driverId);
            Alert.alert(t('common.success'), t('drivers.deleteSuccess'));
            fetchDrivers();
        } catch (err: any) {
            Alert.alert(t('common.error'), err.message || t('drivers.deleteError'));
        } finally {
            setLoading(false);
            setIsDeleteModalVisible(false);
            setDriverToDelete(null);
        }
    };

    useEffect(() => {
        if (params.email && drivers.length > 0) {
            const driver = drivers.find(d => d.driverEmail === params.email);
            if (driver) {
                handleShowDetails(driver);
            }
        }
    }, [params.email, drivers]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchDrivers();
    }, []);

    const getAvatarColor = (index: number) => {
        const avatarColors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
        return avatarColors[index % avatarColors.length];
    };

    const getSelectedFilterLabel = () => {
        const option = STATE_OPTIONS.find(o => o.value === stateFilter);
        return option?.label || 'Tous les états';
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return { bg: '#dcfce7', text: '#16a34a', label: 'Actif' };
            case 'INACTIVE':
                return { bg: '#f1f5f9', text: '#475569', label: 'Inactif' };
            case 'SUSPENDED':
                return { bg: '#fee2e2', text: '#ef4444', label: 'Suspendu' };
            case 'ON_LEAVE':
                return { bg: '#fef3c7', text: '#d97706', label: 'En congé' };
            default:
                return { bg: '#dcfce7', text: '#16a34a', label: 'Actif' };
        }
    };

    const handleShowDetails = (driver: Driver) => {
        setSelectedDriver(driver);
        setIsDetailsModalVisible(true);
    };

    const renderDriverCard = ({ item, index }: { item: Driver; index: number }) => {
        const status = getStatusStyle(item.driverStatus || 'ACTIVE');

        return (
            <ResponsiveDataCard
                title={`${item.driverFirstName} ${item.driverLastName}`}
                subtitle={`ID: ${item.driverId}`}
                avatar={{
                    icon: 'person',
                    color: '#fff',
                    bgColor: getAvatarColor(index),
                }}
                badge={{
                    text: status.label,
                    color: status.text,
                    bgColor: status.bg,
                }}
                fields={[
                    { label: 'Email', value: item.driverEmail, icon: 'mail-outline' },
                    { label: 'Téléphone', value: item.driverPhoneNumber || '-', icon: 'call-outline' },
                    { label: 'Permis', value: item.driverLicenseNumber || '-', icon: 'card-outline', highlight: true },
                    { label: 'Exp. Permis', value: item.driverLicenseExpiry ? new Date(item.driverLicenseExpiry).toLocaleDateString() : '-', icon: 'calendar-outline' },
                ]}
                actions={[
                    { icon: 'eye-outline', label: 'Voir', onPress: () => handleShowDetails(item), color: colors.primaryBlue },
                    { icon: 'create-outline', onPress: () => handleEditDriver(item), color: colors.textSecondary },
                    { icon: 'trash-outline', onPress: () => handleDeleteDriver(item), color: colors.errorBorder },
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

            {!backendOnline && (
                <BackendOfflineBanner
                    message={backendError || undefined}
                    onRetry={onRefresh}
                    isRetrying={refreshing}
                />
            )}

            <ResponsivePageHeader
                title="Mes Chauffeurs"
                subtitle="Gérez vos conducteurs"
                actionLabel="Nouveau"
                actionIcon="add"
                onActionPress={() => setShowCreateModal(true)}
            />

            {/* Search and Filter Row */}
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

            <View style={styles.resultsContainer}>
                <Text style={[styles.resultsText, { color: colors.textMuted }]}>
                    {filteredDrivers.length} chauffeur{filteredDrivers.length !== 1 ? 's' : ''} trouvé{filteredDrivers.length !== 1 ? 's' : ''}
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

            {/* Driver Cards List */}
            <FlatList
                data={filteredDrivers}
                renderItem={renderDriverCard}
                keyExtractor={(item) => item.driverId.toString()}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIcon, { backgroundColor: colors.infoBg }]}>
                            <Ionicons name="person-outline" size={48} color={colors.primaryBlue} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Aucun chauffeur</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Ajoutez votre premier conducteur</Text>
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
                    filteredDrivers.length === 0 && { flex: 1 }
                ]}
            />

            {/* Create Driver Modal */}
            <CreateDriverModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                    fetchDrivers();
                }}
            />

            {/* Edit Driver Modal */}
            <UpdateDriverModal
                visible={isEditModalVisible}
                driver={selectedDriver}
                onClose={() => {
                    setIsEditModalVisible(false);
                    setSelectedDriver(null);
                }}
                onSuccess={() => {
                    setIsEditModalVisible(false);
                    setSelectedDriver(null);
                    fetchDrivers();
                }}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                visible={isDeleteModalVisible}
                onClose={() => {
                    setIsDeleteModalVisible(false);
                    setDriverToDelete(null);
                }}
                onConfirm={confirmDeleteDriver}
                title="Supprimer le chauffeur"
                message={`Voulez-vous vraiment supprimer ${driverToDelete?.driverFirstName} ${driverToDelete?.driverLastName} ? Cette action est irréversible.`}
                confirmText="Supprimer"
                cancelText="Annuler"
                type="danger"
                icon="trash"
                requireTextConfirmation={true}
                confirmationText={driverToDelete ? `${driverToDelete.driverFirstName} ${driverToDelete.driverLastName}` : ''}
            />

            {/* Driver Details Modal */}
            <DataDetailsModal
                visible={isDetailsModalVisible}
                onClose={() => setIsDetailsModalVisible(false)}
                title="Détails du chauffeur"
                description={`${selectedDriver?.driverFirstName} ${selectedDriver?.driverLastName}`}
                icon="person"
                data={[
                    { label: 'Prénom', value: selectedDriver?.driverFirstName, icon: 'person-outline' },
                    { label: 'Nom', value: selectedDriver?.driverLastName, icon: 'person-outline' },
                    { label: 'Email', value: selectedDriver?.driverEmail, icon: 'mail-outline', fullWidth: true },
                    { label: 'Téléphone', value: selectedDriver?.driverPhoneNumber, icon: 'call-outline' },
                    { label: 'Statut', value: selectedDriver?.driverStatus, icon: 'checkmark-circle-outline' },
                    { label: 'N° Permis', value: selectedDriver?.driverLicenseNumber, icon: 'card-outline', fullWidth: true },
                    { label: 'Expiration Permis', value: selectedDriver?.driverLicenseExpiry ? new Date(selectedDriver.driverLicenseExpiry).toLocaleDateString() : '-', icon: 'calendar-outline' },
                    { label: 'Adresse', value: selectedDriver?.driverAddress, icon: 'location-outline', fullWidth: true },
                    { label: 'Date de naissance', value: selectedDriver?.driverDateOfBirth ? new Date(selectedDriver.driverDateOfBirth).toLocaleDateString() : '-', icon: 'gift-outline' },
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

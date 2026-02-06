/**
 * FleetMan Mobile - Managers Screen (Responsive Design)
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
import { useTheme } from '../../src/context/ThemeContext';
import { fleetManagerApi, FleetManager } from '../../src/services';
import {
    DashboardHeader,
    ConfirmModal,
    DataDetailsModal,
    BackendOfflineBanner,
    ResponsiveDataCard,
    ResponsivePageHeader,
} from '../../src/components';
import { UpdateManagerModal } from '../../src/components/UpdateManagerModal';
import CreateManagerModal from '../../src/components/CreateManagerModal';
import { checkBackendHealth } from '../../src/services/healthCheck';

const STATE_OPTIONS = [
    { value: 'ALL', label: 'Tous les états' },
    { value: 'ACTIVE', label: 'Actif' },
    { value: 'INACTIVE', label: 'Inactif' },
    { value: 'ON_LEAVE', label: 'En congé' },
    { value: 'SUSPENDED', label: 'Suspendu' },
];

export default function ManagersScreen() {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const [managers, setManagers] = useState<FleetManager[]>([]);
    const [filteredManagers, setFilteredManagers] = useState<FleetManager[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [stateFilter, setStateFilter] = useState<string>('ALL');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedManager, setSelectedManager] = useState<FleetManager | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [managerToDelete, setManagerToDelete] = useState<FleetManager | null>(null);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [backendOnline, setBackendOnline] = useState<boolean>(true);
    const [backendError, setBackendError] = useState<string | null>(null);

    const fetchManagers = async () => {
        try {
            setError(null);
            setBackendError(null);

            const userStr = await AsyncStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const adminId = user?.adminId;

            const data = await fleetManagerApi.getAll(adminId);

            // If we reach here, backend is online
            setBackendOnline(true);
            setBackendError(null);

            setManagers(data);
            setFilteredManagers(data);
        } catch (err: any) {
            console.error('Error fetching managers:', err);
            setError(err.message || t('common.error'));
            setBackendOnline(false);
            setBackendError(err.message || 'Erreur de connexion au serveur');
            // Clear data when backend is offline
            setManagers([]);
            setFilteredManagers([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchManagers();
    }, []);

    useEffect(() => {
        let filtered = managers;

        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(m => {
                const name = `${m.managerFirstName} ${m.managerLastName}`.toLowerCase();
                const email = (m.managerEmail || '').toLowerCase();
                const phone = (m.managerPhoneNumber || '').toLowerCase();
                return name.includes(query) || email.includes(query) || phone.includes(query);
            });
        }

        if (stateFilter !== 'ALL') {
            filtered = filtered.filter(m => m.managerState === stateFilter);
        }

        setFilteredManagers(filtered);
    }, [searchQuery, stateFilter, managers]);

    const handleEditManager = (manager: FleetManager) => {
        setSelectedManager(manager);
        setIsEditModalVisible(true);
    };

    const handleDeleteManager = (manager: FleetManager) => {
        setManagerToDelete(manager);
        setIsDeleteModalVisible(true);
    };

    const confirmDeleteManager = async () => {
        if (!managerToDelete) return;
        try {
            setLoading(true);
            await fleetManagerApi.delete(managerToDelete.managerId);
            Alert.alert(t('common.success'), t('managers.deleteSuccess'));
            fetchManagers();
        } catch (err: any) {
            Alert.alert(t('common.error'), err.message || t('managers.deleteError'));
        } finally {
            setLoading(false);
            setIsDeleteModalVisible(false);
            setManagerToDelete(null);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchManagers();
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

    const handleShowDetails = (manager: FleetManager) => {
        setSelectedManager(manager);
        setIsDetailsModalVisible(true);
    };

    const renderManagerCard = ({ item, index }: { item: FleetManager; index: number }) => {
        const status = getStatusStyle(item.managerState || 'ACTIVE');

        return (
            <ResponsiveDataCard
                title={`${item.managerFirstName} ${item.managerLastName}`}
                subtitle={`ID: ${item.managerId}`}
                avatar={{
                    icon: 'briefcase',
                    color: '#fff',
                    bgColor: getAvatarColor(index),
                }}
                badge={{
                    text: status.label,
                    color: status.text,
                    bgColor: status.bg,
                }}
                fields={[
                    { label: 'Email', value: item.managerEmail, icon: 'mail-outline' },
                    { label: 'Téléphone', value: item.managerPhoneNumber || '-', icon: 'call-outline' },
                    { label: 'Flottes gérées', value: item.numberOfFleets || 0, icon: 'copy-outline', highlight: true },
                    { label: 'Membres', value: item.numberOfMembers || '-', icon: 'people-outline' },
                ]}
                actions={[
                    { icon: 'eye-outline', label: 'Voir', onPress: () => handleShowDetails(item), color: colors.primaryBlue },
                    { icon: 'create-outline', onPress: () => handleEditManager(item), color: colors.textSecondary },
                    { icon: 'trash-outline', onPress: () => handleDeleteManager(item), color: colors.errorBorder },
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
                title="Mes Gestionnaires"
                subtitle="Gérez vos gestionnaires de flottes"
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
                    {filteredManagers.length} gestionnaire{filteredManagers.length !== 1 ? 's' : ''} trouvé{filteredManagers.length !== 1 ? 's' : ''}
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

            {/* Manager Cards List */}
            <FlatList
                data={filteredManagers}
                renderItem={renderManagerCard}
                keyExtractor={(item) => item.managerId.toString()}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIcon, { backgroundColor: colors.infoBg }]}>
                            <Ionicons name="briefcase-outline" size={48} color={colors.primaryBlue} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Aucun gestionnaire</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Ajoutez votre premier gestionnaire</Text>
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
                    filteredManagers.length === 0 && { flex: 1 }
                ]}
            />

            {/* Create Manager Modal */}
            <CreateManagerModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                    fetchManagers();
                }}
            />

            {/* Edit Manager Modal */}
            <UpdateManagerModal
                visible={isEditModalVisible}
                manager={selectedManager}
                onClose={() => {
                    setIsEditModalVisible(false);
                    setSelectedManager(null);
                }}
                onSuccess={() => {
                    setIsEditModalVisible(false);
                    setSelectedManager(null);
                    fetchManagers();
                }}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                visible={isDeleteModalVisible}
                onClose={() => {
                    setIsDeleteModalVisible(false);
                    setManagerToDelete(null);
                }}
                onConfirm={confirmDeleteManager}
                title="Supprimer le gestionnaire"
                message={`Voulez-vous vraiment supprimer ${managerToDelete?.managerFirstName} ${managerToDelete?.managerLastName} ? Cette action est irréversible.`}
                confirmText="Supprimer"
                cancelText="Annuler"
                type="danger"
                icon="trash"
                requireTextConfirmation={true}
                confirmationText={managerToDelete ? `${managerToDelete.managerFirstName} ${managerToDelete.managerLastName}` : ''}
            />

            {/* Manager Details Modal */}
            <DataDetailsModal
                visible={isDetailsModalVisible}
                onClose={() => setIsDetailsModalVisible(false)}
                title="Détails du gestionnaire"
                description={`${selectedManager?.managerFirstName} ${selectedManager?.managerLastName}`}
                icon="briefcase"
                data={[
                    { label: 'Prénom', value: selectedManager?.managerFirstName, icon: 'person-outline' },
                    { label: 'Nom', value: selectedManager?.managerLastName, icon: 'person-outline' },
                    { label: 'Email', value: selectedManager?.managerEmail, icon: 'mail-outline', fullWidth: true },
                    { label: 'Téléphone', value: selectedManager?.managerPhoneNumber, icon: 'call-outline' },
                    { label: 'Statut', value: selectedManager?.managerState, icon: 'checkmark-circle-outline' },
                    { label: 'Flottes gérées', value: selectedManager?.numberOfFleets, icon: 'copy-outline' },
                    { label: 'Adresse', value: selectedManager?.managerAddress, icon: 'location-outline', fullWidth: true },
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

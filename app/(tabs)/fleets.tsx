/**
 * FleetMan Mobile - Fleets Screen (Responsive Design)
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
    ScrollView,
    Modal,
    Pressable,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { fleetApi, Fleet } from '../../src/services';
import {
    DashboardHeader,
    ConfirmModal,
    DataDetailsModal,
    BackendOfflineBanner,
    ResponsiveDataCard,
    ResponsivePageHeader,
} from '../../src/components';
import { CreateFleetModal } from '../../src/components/CreateFleetModal';
import { UpdateFleetModal } from '../../src/components/UpdateFleetModal';
import { checkBackendHealth } from '../../src/services/healthCheck';

const FLEET_TYPES = [
    { value: 'ALL', label: 'Tous les types' },
    { value: 'PERSONAL', label: 'Personnel' },
    { value: 'PASSENGER_TRANSPORT', label: 'Transport passagers' },
    { value: 'CARGO_TRANSPORT', label: 'Transport cargo' },
    { value: 'DELIVERY', label: 'Livraison' },
    { value: 'RENTAL', label: 'Location' },
    { value: 'MIXED', label: 'Mixte' },
];

export default function FleetsScreen() {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const params = useLocalSearchParams();
    const [fleets, setFleets] = useState<Fleet[]>([]);
    const [filteredFleets, setFilteredFleets] = useState<Fleet[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState((params.search as string) || '');
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null);
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [fleetToDelete, setFleetToDelete] = useState<Fleet | null>(null);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [backendOnline, setBackendOnline] = useState<boolean>(true);
    const [backendError, setBackendError] = useState<string | null>(null);

    const fetchFleets = async () => {
        try {
            setError(null);
            setBackendError(null);

            const userStr = await AsyncStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const adminId = user?.adminId;

            const data = await fleetApi.getAll(adminId);

            // If we reach here, backend is online
            setBackendOnline(true);
            setBackendError(null);

            setFleets(data);
            setFilteredFleets(data);
        } catch (err: any) {
            console.error('Error fetching fleets:', err);
            setError(err.message || t('common.error'));
            setBackendOnline(false);
            setBackendError(err.message || 'Erreur de connexion au serveur');
            // Clear data when backend is offline
            setFleets([]);
            setFilteredFleets([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFleets();
    }, []);

    useEffect(() => {
        let filtered = fleets;

        if (typeFilter !== 'ALL') {
            filtered = filtered.filter(f => f.fleetType === typeFilter);
        }

        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(f => {
                const name = (f.fleetName || '').toLowerCase();
                const desc = (f.fleetDescription || '').toLowerCase();
                return name.includes(query) || desc.includes(query);
            });
        }

        setFilteredFleets(filtered);
    }, [searchQuery, typeFilter, fleets]);

    useEffect(() => {
        if (params.name && fleets.length > 0) {
            const fleet = fleets.find(f => f.fleetName === params.name);
            if (fleet) {
                handleShowDetails(fleet);
            }
        }
    }, [params.name, fleets]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchFleets();
    }, []);

    const getFleetTypeStyle = (type: string) => {
        const types: Record<string, { bg: string; text: string; label: string }> = {
            'CARGO_TRANSPORT': { bg: '#fff7ed', text: '#f97316', label: 'Cargo' },
            'PASSENGER_TRANSPORT': { bg: '#dcfce7', text: '#22c55e', label: 'Passagers' },
            'DELIVERY': { bg: '#fef3c7', text: '#d97706', label: 'Livraison' },
            'RENTAL': { bg: '#f3e8ff', text: '#8b5cf6', label: 'Location' },
            'PERSONAL': { bg: '#e0f2fe', text: '#06b6d4', label: 'Personnel' },
            'MIXED': { bg: '#fef9c3', text: '#ca8a04', label: 'Mixte' },
        };
        return types[type] || { bg: '#f1f5f9', text: '#64748b', label: type };
    };

    const getSelectedTypeLabel = () => {
        const option = FLEET_TYPES.find(o => o.value === typeFilter);
        return option?.label || 'Tous les types';
    };

    const handleEditFleet = (fleet: Fleet) => {
        setSelectedFleet(fleet);
        setIsEditModalVisible(true);
    };

    const handleDeleteFleet = (fleet: Fleet) => {
        setFleetToDelete(fleet);
        setIsDeleteModalVisible(true);
    };

    const confirmDeleteFleet = async () => {
        if (!fleetToDelete) return;
        try {
            setLoading(true);
            await fleetApi.delete(fleetToDelete.fleetId);
            Alert.alert(t('common.success'), t('fleets.deleteSuccess'));
            fetchFleets();
        } catch (err: any) {
            Alert.alert(t('common.error'), err.message || t('fleets.deleteError'));
        } finally {
            setLoading(false);
            setIsDeleteModalVisible(false);
            setFleetToDelete(null);
        }
    };

    const handleShowDetails = (fleet: Fleet) => {
        setSelectedFleet(fleet);
        setIsDetailsModalVisible(true);
    };

    const renderFleetCard = ({ item }: { item: Fleet }) => {
        const typeStyle = getFleetTypeStyle(item.fleetType || 'MIXED');

        return (
            <ResponsiveDataCard
                title={item.fleetName}
                subtitle={item.fleetDescription || 'Aucune description'}
                avatar={{
                    icon: 'copy-outline',
                    color: colors.primaryBlue,
                    bgColor: colors.infoBg,
                }}
                badge={{
                    text: typeStyle.label,
                    color: typeStyle.text,
                    bgColor: typeStyle.bg,
                }}
                fields={[
                    { label: 'Véhicules', value: item.vehiclesCount || 0, icon: 'car-outline', highlight: true },
                    { label: 'Gestionnaire', value: item.fleetManagerName || '-', icon: 'person-outline' },
                    { label: 'Date création', value: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-', icon: 'calendar-outline' },
                    { label: 'ID Flotte', value: item.fleetId, icon: 'key-outline' },
                ]}
                actions={[
                    { icon: 'eye-outline', label: 'Voir', onPress: () => handleShowDetails(item), color: colors.primaryBlue },
                    { icon: 'create-outline', onPress: () => handleEditFleet(item), color: colors.textSecondary },
                    { icon: 'trash-outline', onPress: () => handleDeleteFleet(item), color: colors.errorBorder },
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <DashboardHeader showSearch={false} onRefresh={onRefresh} isRefreshing={refreshing} />

                {!backendOnline && (
                    <BackendOfflineBanner
                        message={backendError || undefined}
                        onRetry={onRefresh}
                        isRetrying={refreshing}
                    />
                )}

                <ResponsivePageHeader
                    title="Gestion des Flottes"
                    subtitle="Gérez vos flottes et leurs managers"
                    actionLabel="Nouvelle"
                    actionIcon="add"
                    onActionPress={() => setIsCreateModalVisible(true)}
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
                        onPress={() => setShowTypeModal(true)}
                    >
                        <Ionicons name="options-outline" size={18} color={colors.textSecondary} />
                        <Text style={[styles.filterText, { color: colors.textSecondary }]} numberOfLines={1}>
                            {getSelectedTypeLabel()}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                </ScrollView>

                <View style={styles.resultsContainer}>
                    <Text style={[styles.resultsText, { color: colors.textMuted }]}>
                        {filteredFleets.length} flotte{filteredFleets.length !== 1 ? 's' : ''} trouvée{filteredFleets.length !== 1 ? 's' : ''}
                    </Text>
                </View>

                {/* Filter Modal */}
                <Modal
                    visible={showTypeModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowTypeModal(false)}
                >
                    <Pressable style={styles.modalOverlay} onPress={() => setShowTypeModal(false)}>
                        <View style={[styles.modalContent, { backgroundColor: colors.surfaceCard }]}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Filtrer par type</Text>
                            <ScrollView style={{ maxHeight: 300 }}>
                                {FLEET_TYPES.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.optionButton,
                                            { borderBottomColor: colors.borderGlass },
                                            typeFilter === option.value && { backgroundColor: colors.infoBg }
                                        ]}
                                        onPress={() => {
                                            setTypeFilter(option.value);
                                            setShowTypeModal(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.optionText,
                                            { color: colors.textSecondary },
                                            typeFilter === option.value && { color: colors.primaryBlue, fontWeight: '600' }
                                        ]}>
                                            {option.label}
                                        </Text>
                                        {typeFilter === option.value && (
                                            <Ionicons name="checkmark" size={20} color={colors.primaryBlue} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </Pressable>
                </Modal>

                {error && (
                    <View style={[styles.errorContainer, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }]}>
                        <Ionicons name="alert-circle" size={20} color={colors.errorBorder} />
                        <Text style={[styles.errorText, { color: colors.errorText }]}>{error}</Text>
                    </View>
                )}

                {/* Fleet Cards List */}
                <FlatList
                    data={filteredFleets}
                    renderItem={renderFleetCard}
                    keyExtractor={(item) => item.fleetId.toString()}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIcon, { backgroundColor: colors.infoBg }]}>
                                <Ionicons name="copy-outline" size={48} color={colors.primaryBlue} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Aucune flotte</Text>
                            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Créez votre première flotte</Text>
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
                        filteredFleets.length === 0 && { flex: 1 }
                    ]}
                />

                {/* Create Fleet Modal */}
                <CreateFleetModal
                    visible={isCreateModalVisible}
                    onClose={() => setIsCreateModalVisible(false)}
                    onSuccess={() => {
                        setIsCreateModalVisible(false);
                        fetchFleets();
                    }}
                />

                {/* Edit Fleet Modal */}
                <UpdateFleetModal
                    visible={isEditModalVisible}
                    fleet={selectedFleet}
                    onClose={() => {
                        setIsEditModalVisible(false);
                        setSelectedFleet(null);
                    }}
                    onSuccess={() => {
                        setIsEditModalVisible(false);
                        setSelectedFleet(null);
                        fetchFleets();
                    }}
                />

                {/* Delete Confirmation Modal */}
                <ConfirmModal
                    visible={isDeleteModalVisible}
                    onClose={() => {
                        setIsDeleteModalVisible(false);
                        setFleetToDelete(null);
                    }}
                    onConfirm={confirmDeleteFleet}
                    title="Supprimer la flotte"
                    message={`Voulez-vous vraiment supprimer la flotte "${fleetToDelete?.fleetName}" ? Cette action est irréversible.`}
                    confirmText="Supprimer"
                    cancelText="Annuler"
                    type="danger"
                    icon="trash"
                    requireTextConfirmation={true}
                    confirmationText={fleetToDelete?.fleetName || ''}
                />

                {/* Fleet Details Modal */}
                <DataDetailsModal
                    visible={isDetailsModalVisible}
                    onClose={() => setIsDetailsModalVisible(false)}
                    title="Détails de la flotte"
                    description={selectedFleet?.fleetName}
                    icon="copy-outline"
                    data={[
                        { label: 'Nom', value: selectedFleet?.fleetName, icon: 'text-outline' },
                        { label: 'Type', value: selectedFleet?.fleetType, icon: 'list-outline' },
                        { label: 'Description', value: selectedFleet?.fleetDescription, icon: 'document-text-outline', fullWidth: true },
                        { label: 'Nombre de véhicules', value: selectedFleet?.vehiclesCount, icon: 'car-outline' },
                        { label: 'Gestionnaire', value: selectedFleet?.fleetManagerName, icon: 'person-outline' },
                        { label: 'Date de création', value: selectedFleet?.createdAt ? new Date(selectedFleet.createdAt).toLocaleDateString() : '-', icon: 'calendar-outline' },
                    ]}
                />
            </KeyboardAvoidingView>
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

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { DashboardHeader } from '../../src/components';
import { tripApi, Trip, TripStatus } from '../../src/services/tripApi';
import { CreateTripModal } from '../../src/components/CreateTripModal';
import { AssignTripModal } from '../../src/components/AssignTripModal';

export default function TripsScreen() {
    const { t } = useTranslation();
    const { colors } = useTheme();
    
    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
    const [selectedTripId, setSelectedTripId] = useState<string>('');
    const [currentDriverId, setCurrentDriverId] = useState<string>('');

    const loadTrips = async () => {
        try {
            const data = await tripApi.getAll();
            setTrips(data);
        } catch (error) {
            console.error('Error loading trips:', error);
            Alert.alert('Erreur', 'Impossible de charger la liste des trajets');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadTrips();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadTrips();
    };

    const handleAssignPress = (trip: Trip) => {
        setSelectedTripId(trip.id);
        setCurrentDriverId(trip.driverId);
        setIsAssignModalVisible(true);
    };

    const getStatusColor = (status: TripStatus) => {
        switch (status) {
            case 'PLANNED': return colors.infoText;
            case 'IN_PROGRESS': return colors.primaryBlue;
            case 'COMPLETED': return colors.successText;
            case 'CANCELLED': return colors.errorText;
            default: return colors.textMuted;
        }
    };

    const getStatusText = (status: TripStatus) => {
        switch (status) {
            case 'PLANNED': return 'Planifié';
            case 'IN_PROGRESS': return 'En cours';
            case 'COMPLETED': return 'Terminé';
            case 'CANCELLED': return 'Annulé';
            default: return status;
        }
    };

    const renderTrip = ({ item }: { item: Trip }) => (
        <View style={[styles.tripCard, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
            <View style={styles.cardHeader}>
                <View style={styles.codeContainer}>
                    <Ionicons name="map" size={16} color={colors.primaryBlue} />
                    <Text style={[styles.tripCode, { color: colors.textPrimary }]}>{item.tripCode}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusText(item.status)}</Text>
                </View>
            </View>

            <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        Date: {item.startDate} {item.startTime}
                    </Text>
                </View>
                {item.departureLocation && (
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                        <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                            Départ: {item.departureLocation}
                        </Text>
                    </View>
                )}
                {item.missionObject && (
                    <View style={styles.detailRow}>
                        <Ionicons name="briefcase-outline" size={16} color={colors.textMuted} />
                        <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                            Mission: {item.missionObject}
                        </Text>
                    </View>
                )}
                
                <View style={styles.divider} />
                
                <View style={styles.entitiesRow}>
                    <View style={styles.entityItem}>
                        <Ionicons name="person" size={14} color={colors.textMuted} />
                        <Text style={[styles.entityText, { color: colors.textPrimary }]} numberOfLines={1}>
                            {item.driverFullName || 'Conducteur Inconnu'}
                        </Text>
                    </View>
                    <View style={styles.entityItem}>
                        <Ionicons name="car" size={14} color={colors.textMuted} />
                        <Text style={[styles.entityText, { color: colors.textPrimary }]} numberOfLines={1}>
                            {item.vehicleRegistration || 'Véhicule Inconnu'}
                        </Text>
                    </View>
                </View>
            </View>

            {item.status === 'PLANNED' && (
                <View style={styles.actionRow}>
                    <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: colors.surfaceCard, borderColor: colors.primaryBlue }]}
                        onPress={() => handleAssignPress(item)}
                    >
                        <Ionicons name="person-add" size={16} color={colors.primaryBlue} />
                        <Text style={[styles.actionBtnText, { color: colors.primaryBlue }]}>Réassigner Conducteur</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <DashboardHeader showSearch={false} />
            
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Gestion des Trajets</Text>
                <TouchableOpacity 
                    style={[styles.createBtn, { backgroundColor: colors.primaryBlue }]}
                    onPress={() => setIsCreateModalVisible(true)}
                >
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.createBtnText}>Nouveau Trajet</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={trips}
                keyExtractor={(item) => item.id}
                renderItem={renderTrip}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="map-outline" size={64} color={colors.borderGlass} />
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Aucun trajet planifié</Text>
                        </View>
                    ) : null
                }
            />

            <CreateTripModal 
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onSuccess={() => {
                    loadTrips();
                }}
            />

            <AssignTripModal 
                visible={isAssignModalVisible}
                tripId={selectedTripId}
                currentDriverId={currentDriverId}
                onClose={() => setIsAssignModalVisible(false)}
                onSuccess={() => {
                    loadTrips();
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
    title: { fontSize: 24, fontWeight: '700' },
    createBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    createBtnText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
    listContainer: { padding: 20, paddingBottom: 100 },
    tripCard: { padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    codeContainer: { flexDirection: 'row', alignItems: 'center' },
    tripCode: { fontSize: 16, fontWeight: '700', marginLeft: 8 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 12, fontWeight: '700' },
    detailsContainer: { gap: 8 },
    detailRow: { flexDirection: 'row', alignItems: 'center' },
    detailText: { marginLeft: 8, fontSize: 14 },
    divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 8 },
    entitiesRow: { flexDirection: 'row', justifyContent: 'space-between' },
    entityItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    entityText: { marginLeft: 4, fontSize: 13, fontWeight: '500' },
    actionRow: { marginTop: 16, flexDirection: 'row', justifyContent: 'flex-end' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
    actionBtnText: { fontWeight: '600', marginLeft: 6, fontSize: 13 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { marginTop: 16, fontSize: 16, fontWeight: '500' }
});

/**
 * FleetMan Mobile - Zones Screen
 * Geofencing zones with interactive map using react-native-maps
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Alert,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LatLng } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../src/context/ThemeContext';
import { geofenceApi, Geofence } from '../../src/services';
import { FleetMap, GeofenceShape, DashboardHeader, DataDetailsModal } from '../../src/components';
import { ConfirmModal } from '../../src/components/ConfirmModal';

const { height, width } = Dimensions.get('window');

interface Zone {
    id: number;
    name: string;
    type: 'CIRCLE' | 'POLYGON';
    status: 'active' | 'inactive';
    vehicleCount: number;
    center?: LatLng;
    radius?: number;
    coordinates?: LatLng[];
}

export default function ZonesScreen() {
    const { t } = useTranslation();
    const { colors, isDarkMode } = useTheme();
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredZones, setFilteredZones] = useState<Zone[]>([]);
    const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [detailedZone, setDetailedZone] = useState<Zone | null>(null);

    const handleShowDetails = (zone: Zone) => {
        setDetailedZone(zone);
        setIsDetailsModalVisible(true);
    };

    // Creation mode state
    const [creationMode, setCreationMode] = useState<'CIRCLE' | 'POLYGON' | null>(null);
    const [tempCenter, setTempCenter] = useState<LatLng | null>(null);
    const [tempRadius, setTempRadius] = useState(500);
    const [tempPoints, setTempPoints] = useState<LatLng[]>([]);
    const [newZoneName, setNewZoneName] = useState('');
    const [newZoneDescription, setNewZoneDescription] = useState('');

    // Convert API geofence to Zone format
    const mapGeofenceToZone = (geofence: Geofence): Zone => {
        let center: LatLng | undefined;
        let coordinates: LatLng[] | undefined;

        if (geofence.geofenceType === 'CIRCLE' && geofence.center) {
            center = {
                latitude: geofence.center.coordinates[1],
                longitude: geofence.center.coordinates[0],
            };
        }

        if (geofence.geofenceType === 'POLYGON' && geofence.vertices) {
            coordinates = geofence.vertices.coordinates.map((coord: number[]) => ({
                latitude: coord[1],
                longitude: coord[0],
            }));
        }

        return {
            id: geofence.geofenceId,
            name: geofence.geofenceName,
            type: geofence.geofenceType,
            status: 'active',
            vehicleCount: 0,
            center,
            radius: geofence.radius,
            coordinates,
        };
    };

    // Fetch zones from API
    const fetchZones = async () => {
        try {
            setLoading(true);
            const userStr = await AsyncStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const adminId = user?.adminId;

            const data = await geofenceApi.getAll(adminId);
            const mappedZones = data.map(mapGeofenceToZone);
            setZones(mappedZones);
        } catch (error) {
            console.error('Error fetching zones:', error);
            setZones([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchZones();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredZones(zones);
        } else {
            const filtered = zones.filter(z =>
                z.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredZones(filtered);
        }
    }, [searchQuery, zones]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchZones();
    }, []);

    // Convert zones to geofence shapes for the map
    const geofenceShapes: GeofenceShape[] = filteredZones.map(zone => ({
        id: zone.id,
        name: zone.name,
        type: zone.type,
        center: zone.center,
        radius: zone.radius,
        coordinates: zone.coordinates,
        isSelected: selectedZone?.id === zone.id,
    }));

    // Handle map press for geofence creation
    const handleMapPress = (coordinate: LatLng) => {
        if (creationMode === 'CIRCLE') {
            setTempCenter(coordinate);
        } else if (creationMode === 'POLYGON') {
            setTempPoints(prev => [...prev, coordinate]);
        }
    };

    // Start creating a new zone
    const startCreation = (type: 'CIRCLE' | 'POLYGON') => {
        setCreationMode(type);
        setTempCenter(null);
        setTempPoints([]);
        setNewZoneName('');
        setNewZoneDescription('');
    };

    // Cancel creation
    const cancelCreation = () => {
        setCreationMode(null);
        setTempCenter(null);
        setTempPoints([]);
        setNewZoneName('');
        setNewZoneDescription('');
    };

    // Save the new zone
    const saveZone = async () => {
        if (!newZoneName.trim()) {
            Alert.alert('Erreur', 'Veuillez entrer un nom pour la zone');
            return;
        }

        try {
            setLoading(true);
            const userJson = await AsyncStorage.getItem('user');
            if (!userJson) throw new Error('Utilisateur non connecté');
            const user = JSON.parse(userJson);

            // Check if user is admin or fleet manager
            const isAdmin = user.userType === 'admin' || user.adminId;
            const adminId = user.adminId;
            const managerId = user.userId;

            if (creationMode === 'CIRCLE' && tempCenter) {
                if (isAdmin && adminId) {
                    // Use admin endpoint
                    await geofenceApi.createCircleAsAdmin(adminId, {
                        geofenceName: newZoneName,
                        centerLongitude: tempCenter.longitude,
                        centerLatitude: tempCenter.latitude,
                        radius: tempRadius,
                    });
                } else {
                    // Use regular endpoint with fleetManagerId
                    await geofenceApi.createCircle({
                        geofenceName: newZoneName,
                        centerLongitude: tempCenter.longitude,
                        centerLatitude: tempCenter.latitude,
                        radius: tempRadius,
                        fleetManagerId: managerId,
                    });
                }
            } else if (creationMode === 'POLYGON' && tempPoints.length >= 3) {
                if (isAdmin && adminId) {
                    // Use admin endpoint
                    await geofenceApi.createPolygonAsAdmin(adminId, {
                        geofenceName: newZoneName,
                        vertices: tempPoints.map(p => ({
                            longitude: p.longitude,
                            latitude: p.latitude
                        })),
                    });
                } else {
                    // Use regular endpoint with fleetManagerId
                    await geofenceApi.createPolygon({
                        geofenceName: newZoneName,
                        vertices: tempPoints.map(p => ({
                            longitude: p.longitude,
                            latitude: p.latitude
                        })),
                        fleetManagerId: managerId,
                    });
                }
            }

            Alert.alert('Succès', 'Zone créée avec succès');
            cancelCreation();
            fetchZones();
        } catch (error: any) {
            console.error('Error creating zone:', error);
            Alert.alert('Erreur', error.message || 'Impossible de créer la zone');
        } finally {
            setLoading(false);
        }
    };

    // Delete a zone - show confirmation modal
    const deleteZone = (zoneId: number) => {
        const zone = zones.find(z => z.id === zoneId);
        if (zone) {
            setZoneToDelete(zone);
            setIsDeleteModalVisible(true);
        }
    };

    // Confirm delete zone
    const confirmDeleteZone = async () => {
        if (!zoneToDelete) return;

        try {
            setLoading(true);
            await geofenceApi.delete(zoneToDelete.id);
            setSelectedZone(null);
            setIsDeleteModalVisible(false);
            setZoneToDelete(null);
            fetchZones();
        } catch (error) {
            console.error('Error deleting zone:', error);
            Alert.alert('Erreur', 'Impossible de supprimer la zone');
        } finally {
            setLoading(false);
            setIsDeleteModalVisible(false);
        }
    };

    // Handle geofence press on map
    const handleGeofencePress = (geofence: GeofenceShape) => {
        const zone = zones.find(z => z.id === geofence.id);
        setSelectedZone(zone || null);
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'CIRCLE': return colors.primaryBlue;
            case 'POLYGON': return colors.successText;
            default: return colors.textSecondary;
        }
    };

    const getTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
        switch (type) {
            case 'CIRCLE': return 'ellipse-outline';
            case 'POLYGON': return 'shapes-outline';
            default: return 'location-outline';
        }
    };

    const renderZoneCard = ({ item }: { item: Zone }) => (
        <TouchableOpacity
            style={[styles.card, {
                backgroundColor: colors.surfaceCard,
                borderColor: selectedZone?.id === item.id ? colors.primaryBlue : colors.borderGlass,
                borderWidth: selectedZone?.id === item.id ? 2 : 1,
            }]}
            activeOpacity={0.7}
            onPress={() => {
                setSelectedZone(selectedZone?.id === item.id ? null : item);
                handleShowDetails(item);
            }}
        >
            <View style={[styles.iconContainer, { backgroundColor: getTypeColor(item.type) + '20' }]}>
                <Ionicons name={getTypeIcon(item.type)} size={24} color={getTypeColor(item.type)} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{item.name}</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {item.type === 'CIRCLE' ? `Rayon: ${item.radius}m` : `${item.coordinates?.length || 0} points`}
                </Text>
            </View>
            <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: colors.errorText + '20' }]}
                onPress={() => deleteZone(item.id)}
            >
                <Ionicons name="trash-outline" size={18} color={colors.errorText} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const isLargeScreen = width > 768;

    if (loading && !refreshing && zones.length === 0) {
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingContainer}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >

                {/* Dashboard Header */}
                <DashboardHeader
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onRefresh={onRefresh}
                    isRefreshing={refreshing}
                />

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Zones (Geofencing)</Text>
                        <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
                            {creationMode ? `Nouvelle Zone (${creationMode === 'CIRCLE' ? 'Cercle' : 'Polygone'})` : 'Gérez vos zones de surveillance'}
                        </Text>
                    </View>

                    <View style={styles.headerActions}>
                        {creationMode ? (
                            <View style={styles.headerButtonsContainer}>
                                <TouchableOpacity
                                    style={[styles.compactHeaderButton, { backgroundColor: colors.successText }]}
                                    onPress={saveZone}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator size="small" color="white" /> : (
                                        <Ionicons name="checkmark" size={22} color="white" />
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.compactHeaderButton, { backgroundColor: colors.errorText }]}
                                    onPress={cancelCreation}
                                    disabled={loading}
                                >
                                    <Ionicons name="close" size={22} color="white" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.createButtonsRow}>
                                <TouchableOpacity
                                    style={[styles.iconHeaderButton, { backgroundColor: colors.primaryBlue }]}
                                    onPress={() => startCreation('CIRCLE')}
                                >
                                    <Ionicons name="ellipse-outline" size={20} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.iconHeaderButton, { backgroundColor: colors.successText }]}
                                    onPress={() => startCreation('POLYGON')}
                                >
                                    <Ionicons name="shapes-outline" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                <View style={[styles.mainLayout, isLargeScreen && styles.splitLayout]}>
                    {/* Left Panel: Form (Creation) or List (Default) */}
                    <View style={[styles.panel, isLargeScreen && styles.sidePanel]}>
                        {creationMode ? (
                            <ScrollView
                                style={[styles.creationForm, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}
                                contentContainerStyle={styles.creationFormContent}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
                                    {creationMode === 'CIRCLE' ? 'Nouvelle Zone (Cercle)' : 'Nouvelle Zone (Polygone)'}
                                </Text>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Nom</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.surfaceGlass, color: colors.textPrimary, borderColor: colors.borderGlass }]}
                                        placeholder="Ex: Entrepôt Principal"
                                        placeholderTextColor={colors.textMuted}
                                        value={newZoneName}
                                        onChangeText={setNewZoneName}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea, { backgroundColor: colors.surfaceGlass, color: colors.textPrimary, borderColor: colors.borderGlass }]}
                                        placeholder="Description de la zone..."
                                        placeholderTextColor={colors.textMuted}
                                        value={newZoneDescription}
                                        onChangeText={setNewZoneDescription}
                                        multiline
                                        numberOfLines={4}
                                    />
                                </View>

                                <View style={[styles.helpBox, { backgroundColor: '#3b82f610', borderColor: '#3b82f630' }]}>
                                    <Ionicons name="information-circle-outline" size={20} color={colors.primaryBlue} />
                                    <Text style={[styles.helpText, { color: colors.primaryBlue }]}>
                                        {creationMode === 'CIRCLE'
                                            ? 'Cliquez sur la carte pour définir le centre, puis ajustez le rayon.'
                                            : 'Cliquez sur la carte pour ajouter des points. Le polygone se fermera automatiquement.'}
                                    </Text>
                                </View>

                                {creationMode === 'CIRCLE' && tempCenter && (
                                    <View style={styles.radiusControlSide}>
                                        <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 10 }]}>Rayon: {tempRadius}m</Text>
                                        <View style={styles.radiusButtonsRow}>
                                            <TouchableOpacity
                                                style={[styles.radiusBtn, { backgroundColor: colors.surfaceGlass }]}
                                                onPress={() => setTempRadius(Math.max(100, tempRadius - 100))}
                                            >
                                                <Ionicons name="remove" size={20} color={colors.textPrimary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.radiusBtn, { backgroundColor: colors.surfaceGlass }]}
                                                onPress={() => setTempRadius(tempRadius + 100)}
                                            >
                                                <Ionicons name="add" size={20} color={colors.textPrimary} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}

                                {creationMode === 'POLYGON' && tempPoints.length > 0 && (
                                    <View style={[styles.pointsInfo, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
                                        <Ionicons name="shapes" size={18} color={colors.successText} />
                                        <Text style={[styles.pointsInfoText, { color: colors.successText }]}>
                                            {tempPoints.length} point{tempPoints.length > 1 ? 's' : ''} défini{tempPoints.length > 1 ? 's' : ''}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.formActions}>
                                    <TouchableOpacity
                                        style={[styles.cancelBtn, { borderColor: colors.errorText }]}
                                        onPress={cancelCreation}
                                    >
                                        <Text style={[styles.cancelBtnText, { color: colors.errorText }]}>Annuler la définition</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.saveBtn, { backgroundColor: colors.successText }]}
                                        onPress={saveZone}
                                        disabled={loading}
                                    >
                                        <Text style={styles.saveBtnText}>Enregistrer la Zone</Text>
                                        {loading && <ActivityIndicator size="small" color="white" style={{ marginLeft: 8 }} />}
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        ) : (
                            <View style={[styles.listPanel, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                                <Text style={[styles.listTitle, { color: colors.textPrimary }]}>Liste des Zones</Text>
                                <FlatList
                                    data={filteredZones}
                                    renderItem={renderZoneCard}
                                    keyExtractor={(item) => item.id.toString()}
                                    showsVerticalScrollIndicator={false}
                                    ListEmptyComponent={
                                        <View style={styles.emptyState}>
                                            <Ionicons name="location-outline" size={48} color={colors.textMuted} />
                                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Aucune zone définie</Text>
                                        </View>
                                    }
                                    refreshControl={
                                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryBlue} />
                                    }
                                />
                            </View>
                        )}
                    </View>

                    {/* Right Panel: Map */}
                    <View style={[styles.panel, isLargeScreen && styles.mapPanel]}>
                        <View style={[styles.mapContainer, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                            <FleetMap
                                geofences={geofenceShapes}
                                onGeofencePress={handleGeofencePress}
                                onMapPress={handleMapPress}
                                creationMode={creationMode}
                                tempCenter={tempCenter}
                                tempRadius={tempRadius}
                                tempPoints={tempPoints}
                            />
                        </View>
                    </View>
                </View>

                {/* Delete Confirmation Modal */}
                <ConfirmModal
                    visible={isDeleteModalVisible}
                    onClose={() => {
                        setIsDeleteModalVisible(false);
                        setZoneToDelete(null);
                    }}
                    onConfirm={confirmDeleteZone}
                    title="Supprimer la zone"
                    message={`Voulez-vous vraiment supprimer la zone "${zoneToDelete?.name}" ? Cette action est irréversible.`}
                    confirmText="Supprimer"
                    cancelText="Annuler"
                    type="danger"
                    icon="trash"
                    requireTextConfirmation={true}
                    confirmationText={zoneToDelete?.name || ''}
                />

                {/* Zone Details Modal */}
                <DataDetailsModal
                    visible={isDetailsModalVisible}
                    onClose={() => setIsDetailsModalVisible(false)}
                    title="Détails de la zone"
                    description={detailedZone?.name}
                    icon={detailedZone ? getTypeIcon(detailedZone.type) : 'location'}
                    iconColor={detailedZone ? getTypeColor(detailedZone.type) : undefined}
                    data={[
                        { label: 'Nom de la zone', value: detailedZone?.name, icon: 'text-outline', fullWidth: true },
                        { label: 'Type de forme', value: detailedZone?.type, icon: 'shapes-outline' },
                        { label: 'Statut', value: detailedZone?.status, icon: 'flash-outline' },
                        { label: 'Rayon', value: detailedZone?.type === 'CIRCLE' ? `${detailedZone.radius}m` : 'N/A', icon: 'contract-outline' },
                        { label: 'Nombre de points', value: detailedZone?.type === 'POLYGON' ? detailedZone.coordinates?.length : 'N/A', icon: 'list-outline' },
                        { label: 'Centre (Lat)', value: detailedZone?.center?.latitude?.toFixed(6), icon: 'pin-outline' },
                        { label: 'Centre (Lng)', value: detailedZone?.center?.longitude?.toFixed(6), icon: 'pin-outline' },
                        { label: 'Véhicules à l\'intérieur', value: detailedZone?.vehicleCount || 0, icon: 'car-outline' },
                    ]}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardAvoidingContainer: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14 },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    pageTitle: { fontSize: 22, fontWeight: '700' },
    pageSubtitle: { fontSize: 13, marginTop: 4 },

    headerActions: { flexDirection: 'row', gap: 10 },
    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 8,
    },
    headerButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
    headerButtonsContainer: { flexDirection: 'row', gap: 8 },
    compactHeaderButton: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    createButtonsRow: { flexDirection: 'row', gap: 8 },
    iconHeaderButton: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

    mainLayout: { flex: 1, paddingHorizontal: 16, paddingBottom: 16, gap: 16 },
    splitLayout: { flexDirection: 'row' },
    panel: { flex: 1 },
    sidePanel: { flex: 1, maxWidth: 380 },
    mapPanel: { flex: 2 },

    // Creation Form
    creationForm: { flex: 1, borderRadius: 16, borderWidth: 1 },
    creationFormContent: { padding: 20, gap: 16 },
    formTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: '500' },
    input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
    textArea: { height: 100, textAlignVertical: 'top' },
    helpBox: { flexDirection: 'row', padding: 12, borderRadius: 10, borderWidth: 1, gap: 10 },
    helpText: { flex: 1, fontSize: 13, lineHeight: 18 },
    pointsInfo: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, gap: 10 },
    pointsInfoText: { fontSize: 14, fontWeight: '500' },

    radiusControlSide: { marginTop: 8 },
    radiusButtonsRow: { flexDirection: 'row', gap: 12 },
    radiusBtn: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

    // List Panel
    listPanel: { flex: 1, borderRadius: 16, borderWidth: 1, paddingVertical: 8 },
    listTitle: { fontSize: 16, fontWeight: '600', padding: 20, paddingBottom: 12 },

    // Map
    mapContainer: { flex: 1, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },

    // Card
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 10,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    iconContainer: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    content: { flex: 1 },
    title: { fontSize: 15, fontWeight: '600' },
    subtitle: { fontSize: 12, marginTop: 2 },
    deleteButton: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
    emptyText: { marginTop: 12, fontSize: 14, fontWeight: '500' },

    formActions: { marginTop: 10, gap: 12, paddingBottom: 20 },
    saveBtn: {
        height: 50,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
    cancelBtn: {
        height: 50,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: { fontSize: 16, fontWeight: '600' },
});

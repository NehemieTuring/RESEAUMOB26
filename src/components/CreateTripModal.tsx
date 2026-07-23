import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { tripApi, TripCreate } from '../services/tripApi';
import { vehicleApi, Vehicle } from '../services/vehicleApi';
import { driverApi, Driver } from '../services/driverApi';
import { fleetApi, Fleet } from '../services/fleetApi';

interface CreateTripModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({ visible, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [fleets, setFleets] = useState<Fleet[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [selectedFleetId, setSelectedFleetId] = useState<string>('');
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
    const [selectedDriverId, setSelectedDriverId] = useState<string>('');
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState<string>('08:00:00');
    const [departureLocation, setDepartureLocation] = useState('');
    const [missionObject, setMissionObject] = useState('');

    useEffect(() => {
        if (visible) {
            loadData();
        }
    }, [visible]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [vList, dList, fList] = await Promise.all([
                vehicleApi.getAll(),
                driverApi.getAll(),
                fleetApi.getAll()
            ]);
            setVehicles(vList);
            setDrivers(dList);
            setFleets(fList);
            
            if (fList.length > 0 && !selectedFleetId) setSelectedFleetId(fList[0].id);
            if (vList.length > 0 && !selectedVehicleId) setSelectedVehicleId(vList[0].vehicleId);
            if (dList.length > 0 && !selectedDriverId) setSelectedDriverId(dList[0].driverId);
        } catch (err) {
            console.error('Error loading data for trip creation:', err);
            Alert.alert('Erreur', 'Impossible de charger les données');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedFleetId || !selectedVehicleId || !selectedDriverId || !startDate || !startTime) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: TripCreate = {
                fleetId: selectedFleetId,
                vehicleId: selectedVehicleId,
                driverId: selectedDriverId,
                startDate: startDate,
                startTime: startTime,
                departureLocation: departureLocation,
                missionObject: missionObject
            };
            
            await tripApi.create(payload);
            Alert.alert('Succès', 'Trajet créé avec succès');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating trip:', error);
            Alert.alert('Erreur', 'La création du trajet a échoué');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Créer un trajet</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primaryBlue} />
                        </View>
                    ) : (
                        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                            
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Flotte</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                                {fleets.map(f => (
                                    <TouchableOpacity 
                                        key={f.id} 
                                        style={[styles.chip, { backgroundColor: selectedFleetId === f.id ? colors.primaryBlue : colors.surfaceCard }]}
                                        onPress={() => setSelectedFleetId(f.id)}
                                    >
                                        <Text style={{ color: selectedFleetId === f.id ? '#fff' : colors.textPrimary }}>{f.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={[styles.label, { color: colors.textPrimary }]}>Véhicule</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                                {vehicles.map(v => (
                                    <TouchableOpacity 
                                        key={v.vehicleId} 
                                        style={[styles.chip, { backgroundColor: selectedVehicleId === v.vehicleId ? colors.primaryBlue : colors.surfaceCard }]}
                                        onPress={() => setSelectedVehicleId(v.vehicleId)}
                                    >
                                        <Text style={{ color: selectedVehicleId === v.vehicleId ? '#fff' : colors.textPrimary }}>{v.vehicleRegistrationNumber}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={[styles.label, { color: colors.textPrimary }]}>Conducteur</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                                {drivers.map(d => (
                                    <TouchableOpacity 
                                        key={d.driverId} 
                                        style={[styles.chip, { backgroundColor: selectedDriverId === d.driverId ? colors.primaryBlue : colors.surfaceCard }]}
                                        onPress={() => setSelectedDriverId(d.driverId)}
                                    >
                                        <Text style={{ color: selectedDriverId === d.driverId ? '#fff' : colors.textPrimary }}>{d.driverFirstName} {d.driverLastName}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={[styles.label, { color: colors.textPrimary }]}>Date de début (YYYY-MM-DD)</Text>
                            <TextInput 
                                style={[styles.input, { color: colors.textPrimary, borderColor: colors.borderGlass }]}
                                value={startDate}
                                onChangeText={setStartDate}
                            />

                            <Text style={[styles.label, { color: colors.textPrimary }]}>Heure de départ (HH:mm:ss)</Text>
                            <TextInput 
                                style={[styles.input, { color: colors.textPrimary, borderColor: colors.borderGlass }]}
                                value={startTime}
                                onChangeText={setStartTime}
                            />

                            <Text style={[styles.label, { color: colors.textPrimary }]}>Lieu de départ (Optionnel)</Text>
                            <TextInput 
                                style={[styles.input, { color: colors.textPrimary, borderColor: colors.borderGlass }]}
                                value={departureLocation}
                                onChangeText={setDepartureLocation}
                            />

                            <Text style={[styles.label, { color: colors.textPrimary }]}>Objet de la mission (Optionnel)</Text>
                            <TextInput 
                                style={[styles.input, { color: colors.textPrimary, borderColor: colors.borderGlass }]}
                                value={missionObject}
                                onChangeText={setMissionObject}
                                multiline
                            />

                            <TouchableOpacity 
                                style={[styles.submitBtn, { backgroundColor: colors.primaryBlue }]}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitBtnText}>Créer le trajet</Text>
                                )}
                            </TouchableOpacity>
                            <View style={{height: 40}}/>
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 20, fontWeight: '700' },
    closeButton: { padding: 4 },
    loadingContainer: { padding: 40, alignItems: 'center' },
    formContainer: { },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
    input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 8 },
    horizontalScroll: { flexDirection: 'row', marginBottom: 8 },
    chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    submitBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});

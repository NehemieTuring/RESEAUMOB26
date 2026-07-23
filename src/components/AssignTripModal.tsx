import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { tripApi } from '../services/tripApi';
import { driverApi, Driver } from '../services/driverApi';

interface AssignTripModalProps {
    visible: boolean;
    tripId: string;
    currentDriverId?: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const AssignTripModal: React.FC<AssignTripModalProps> = ({ visible, tripId, currentDriverId, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [selectedDriverId, setSelectedDriverId] = useState<string>('');

    useEffect(() => {
        if (visible) {
            loadDrivers();
            if (currentDriverId) {
                setSelectedDriverId(currentDriverId);
            } else {
                setSelectedDriverId('');
            }
        }
    }, [visible, currentDriverId]);

    const loadDrivers = async () => {
        setIsLoading(true);
        try {
            const dList = await driverApi.getAll();
            setDrivers(dList);
        } catch (err) {
            console.error('Error loading drivers:', err);
            Alert.alert('Erreur', 'Impossible de charger les conducteurs');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedDriverId) {
            Alert.alert('Erreur', 'Veuillez sélectionner un conducteur');
            return;
        }
        if (selectedDriverId === currentDriverId) {
            Alert.alert('Info', 'Ce conducteur est déjà assigné à ce trajet');
            return;
        }

        setIsSubmitting(true);
        try {
            await tripApi.assignDriver(tripId, selectedDriverId);
            Alert.alert('Succès', 'Conducteur assigné avec succès');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error assigning driver:', error);
            Alert.alert('Erreur', 'L\'assignation du conducteur a échoué');
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
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Assigner un conducteur</Text>
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
                            
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Conducteurs disponibles</Text>
                            {drivers.map(d => (
                                <TouchableOpacity 
                                    key={d.driverId} 
                                    style={[
                                        styles.driverRow, 
                                        { 
                                            backgroundColor: colors.surfaceCard, 
                                            borderColor: selectedDriverId === d.driverId ? colors.primaryBlue : colors.borderGlass,
                                            borderWidth: selectedDriverId === d.driverId ? 2 : 1
                                        }
                                    ]}
                                    onPress={() => setSelectedDriverId(d.driverId)}
                                >
                                    <View style={[styles.driverIcon, { backgroundColor: colors.primaryBlue + '20' }]}>
                                        <Ionicons name="person" size={20} color={colors.primaryBlue} />
                                    </View>
                                    <Text style={[styles.driverName, { color: colors.textPrimary }]}>{d.driverFirstName} {d.driverLastName}</Text>
                                    {selectedDriverId === d.driverId && (
                                        <Ionicons name="checkmark-circle" size={24} color={colors.primaryBlue} />
                                    )}
                                </TouchableOpacity>
                            ))}

                            <TouchableOpacity 
                                style={[styles.submitBtn, { backgroundColor: colors.primaryBlue, opacity: selectedDriverId ? 1 : 0.5 }]}
                                onPress={handleSubmit}
                                disabled={isSubmitting || !selectedDriverId}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitBtnText}>Confirmer l'assignation</Text>
                                )}
                            </TouchableOpacity>
                            <View style={{height: 20}}/>
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
    label: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
    driverRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8 },
    driverIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    driverName: { flex: 1, fontSize: 16, fontWeight: '500' },
    submitBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});

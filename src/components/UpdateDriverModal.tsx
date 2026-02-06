/**
 * FleetMan Mobile - Update Driver Modal
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { CreateModal, FormField } from './CreateModal';
import { FormInput } from './FormInput';
import { driverApi, Driver } from '../services';
import { useTheme } from '../context/ThemeContext';

interface UpdateDriverModalProps {
    visible: boolean;
    driver: Driver | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const UpdateDriverModal: React.FC<UpdateDriverModalProps> = ({
    visible,
    driver,
    onClose,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        driverFirstName: '',
        driverLastName: '',
        driverEmail: '',
        driverPhoneNumber: '',
        driverLicenseNumber: '',
        driverCardNumber: '',
        driverEmergencyContactName: '',
        driverEmergencyContactPhone: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (driver) {
            setFormData({
                driverFirstName: driver.driverFirstName,
                driverLastName: driver.driverLastName,
                driverEmail: driver.driverEmail,
                driverPhoneNumber: driver.driverPhoneNumber || '',
                driverLicenseNumber: driver.driverLicenseNumber || '',
                driverCardNumber: driver.driverCardNumber || '',
                driverEmergencyContactName: driver.driverEmergencyContactName || '',
                driverEmergencyContactPhone: driver.driverEmergencyContactPhone || '',
            });
        }
    }, [driver]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.driverFirstName.trim()) newErrors.driverFirstName = 'Le prénom est requis';
        if (!formData.driverLastName.trim()) newErrors.driverLastName = 'Le nom est requis';
        if (!formData.driverEmail.trim()) newErrors.driverEmail = 'L\'email est requis';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate() || !driver) return;

        setLoading(true);
        try {
            await driverApi.update(driver.driverId, {
                driverFirstName: formData.driverFirstName,
                driverLastName: formData.driverLastName,
                driverEmail: formData.driverEmail,
                driverPhoneNumber: formData.driverPhoneNumber || undefined,
                driverLicenseNumber: formData.driverLicenseNumber || undefined,
                driverCardNumber: formData.driverCardNumber || undefined,
                driverEmergencyContactName: formData.driverEmergencyContactName || undefined,
                driverEmergencyContactPhone: formData.driverEmergencyContactPhone || undefined,
            });

            Alert.alert(t('common.success'), 'Le chauffeur a été mis à jour avec succès.');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating driver:', error);
            Alert.alert(t('common.error'), error.message || 'Une erreur est survenue lors de la mise à jour.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <CreateModal
            visible={visible}
            onClose={onClose}
            title="Modifier le Chauffeur"
            onSubmit={handleSubmit}
            loading={loading}
            submitText="Enregistrer les modifications"
            cancelText="Annuler"
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={[styles.infoBox, { backgroundColor: colors.surfaceGlass }]}>
                    <Ionicons name="person-outline" size={20} color={colors.primaryBlue} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        Mettez à jour les informations de {driver?.driverFirstName} {driver?.driverLastName}.
                    </Text>
                </View>

                <View style={styles.formRow}>
                    <View style={{ flex: 1 }}>
                        <FormField label="Prénom *" required>
                            <FormInput
                                placeholder="Prénom"
                                value={formData.driverFirstName}
                                onChangeText={(text) => setFormData({ ...formData, driverFirstName: text })}
                                error={errors.driverFirstName}
                            />
                        </FormField>
                    </View>
                    <View style={{ flex: 1 }}>
                        <FormField label="Nom *" required>
                            <FormInput
                                placeholder="Nom"
                                value={formData.driverLastName}
                                onChangeText={(text) => setFormData({ ...formData, driverLastName: text })}
                                error={errors.driverLastName}
                            />
                        </FormField>
                    </View>
                </View>

                <FormField label="Email *" required>
                    <FormInput
                        placeholder="email@exemple.com"
                        value={formData.driverEmail}
                        onChangeText={(text) => setFormData({ ...formData, driverEmail: text })}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.driverEmail}
                    />
                </FormField>

                <FormField label="Téléphone">
                    <FormInput
                        placeholder="+237 ..."
                        value={formData.driverPhoneNumber}
                        onChangeText={(text) => setFormData({ ...formData, driverPhoneNumber: text.replace(/[^0-9+]/g, '') })}
                        keyboardType="phone-pad"
                    />
                </FormField>

                <View style={styles.formRow}>
                    <View style={{ flex: 1 }}>
                        <FormField label="N° de permis">
                            <FormInput
                                placeholder="Permis"
                                value={formData.driverLicenseNumber}
                                onChangeText={(text) => setFormData({ ...formData, driverLicenseNumber: text })}
                            />
                        </FormField>
                    </View>
                    <View style={{ flex: 1 }}>
                        <FormField label="N° de carte">
                            <FormInput
                                placeholder="Carte"
                                value={formData.driverCardNumber}
                                onChangeText={(text) => setFormData({ ...formData, driverCardNumber: text })}
                            />
                        </FormField>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Contact d'urgence</Text>

                <FormField label="Nom du contact">
                    <FormInput
                        placeholder="Nom complet"
                        value={formData.driverEmergencyContactName}
                        onChangeText={(text) => setFormData({ ...formData, driverEmergencyContactName: text })}
                    />
                </FormField>

                <FormField label="Téléphone du contact">
                    <FormInput
                        placeholder="+237 ..."
                        value={formData.driverEmergencyContactPhone}
                        onChangeText={(text) => setFormData({ ...formData, driverEmergencyContactPhone: text.replace(/[^0-9+]/g, '') })}
                        keyboardType="phone-pad"
                    />
                </FormField>
            </ScrollView>
        </CreateModal>
    );
};

const styles = StyleSheet.create({
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
        padding: 12,
        borderRadius: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
    },
    formRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 10,
        color: '#1e293b',
    },
});

export default UpdateDriverModal;

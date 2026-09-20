/**
 * Édition d'un chauffeur — champs persistés (users + drivers).
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { CreateModal, FormField, FormRow } from './CreateModal';
import { FormInput, FormSelect } from './FormInput';
import { driverApi, type Driver, type Fleet } from '../services';
import { fleetApi } from '../services/fleetApi';
import { useTheme } from '../context/ThemeContext';

interface UpdateDriverModalProps {
    visible: boolean;
    driver: Driver | null;
    onClose: () => void;
    onSuccess: () => void;
    fleets?: Fleet[];
}

const STATUS_OPTIONS = [
    { label: 'Actif', value: 'ACTIVE' },
    { label: 'Inactif', value: 'INACTIVE' },
];

export const UpdateDriverModal: React.FC<UpdateDriverModalProps> = ({
    visible,
    driver,
    onClose,
    onSuccess,
    fleets: fleetsProp,
}) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);
    const [fleets, setFleets] = useState<Fleet[]>(fleetsProp ?? []);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        licenseNumber: '',
        status: 'ACTIVE',
        fleetId: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (fleetsProp && fleetsProp.length) {
            setFleets(fleetsProp);
            return;
        }
        if (visible) {
            fleetApi.getAll().then(setFleets).catch(() => setFleets([]));
        }
    }, [visible, fleetsProp]);

    useEffect(() => {
        if (driver) {
            setFormData({
                firstName: driver.driverFirstName || '',
                lastName: driver.driverLastName || '',
                email: driver.driverEmail || '',
                phone: driver.driverPhoneNumber || '',
                licenseNumber: driver.driverLicenseNumber || '',
                status: driver.driverStatus === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
                fleetId: driver.fleetId || '',
            });
            setErrors({});
        }
    }, [driver]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
        if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
        if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
        if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'Le permis est requis';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate() || !driver) return;
        setLoading(true);
        try {
            await driverApi.update(driver.driverId, {
                driverFirstName: formData.firstName.trim(),
                driverLastName: formData.lastName.trim(),
                driverEmail: formData.email.trim(),
                driverPhoneNumber: formData.phone.trim() || undefined,
                driverLicenseNumber: formData.licenseNumber.trim(),
                driverStatus: formData.status,
                fleetId: formData.fleetId || undefined,
            });
            Alert.alert(t('common.success'), 'Chauffeur mis à jour');
            onSuccess();
            onClose();
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message || 'Mise à jour impossible');
        } finally {
            setLoading(false);
        }
    };

    return (
        <CreateModal
            visible={visible}
            onClose={onClose}
            title="Modifier le chauffeur"
            onSubmit={handleSubmit}
            loading={loading}
            submitText="Enregistrer"
            cancelText="Annuler"
        >
            <View style={[styles.infoBox, { backgroundColor: colors.surfaceGlass }]}>
                <Ionicons name="person-outline" size={20} color={colors.primaryBlue} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    {driver?.driverFirstName} {driver?.driverLastName}
                    {driver?.username ? ` · @${driver.username}` : ''}
                </Text>
            </View>

            <FormRow>
                <FormField label="Prénom" required halfWidth>
                    <FormInput
                        value={formData.firstName}
                        onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                        error={errors.firstName}
                    />
                </FormField>
                <FormField label="Nom" required halfWidth>
                    <FormInput
                        value={formData.lastName}
                        onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                        error={errors.lastName}
                    />
                </FormField>
            </FormRow>

            <FormField label="Email" required>
                <FormInput
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                />
            </FormField>

            <FormRow>
                <FormField label="Téléphone" halfWidth>
                    <FormInput
                        value={formData.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text.replace(/[^0-9+]/g, '') })}
                        keyboardType="phone-pad"
                    />
                </FormField>
                <FormField label="N° de permis" required halfWidth>
                    <FormInput
                        value={formData.licenseNumber}
                        onChangeText={(text) => setFormData({ ...formData, licenseNumber: text })}
                        error={errors.licenseNumber}
                    />
                </FormField>
            </FormRow>

            <FormField label="Flotte" zIndex={500}>
                <FormSelect
                    value={formData.fleetId}
                    options={[
                        { label: 'Aucune flotte', value: '' },
                        ...fleets.map((f) => ({ label: f.fleetName, value: f.fleetId.toString() })),
                    ]}
                    onSelect={(value) => setFormData({ ...formData, fleetId: value })}
                    zIndex={500}
                />
            </FormField>

            <FormField label="Statut" zIndex={400}>
                <FormSelect
                    value={formData.status}
                    options={STATUS_OPTIONS}
                    onSelect={(value) => setFormData({ ...formData, status: value })}
                    zIndex={400}
                    openDirection="up"
                />
            </FormField>
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
});

export default UpdateDriverModal;

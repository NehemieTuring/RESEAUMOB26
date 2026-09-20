/**
 * Création d'un chauffeur — champs alignés sur fleet.users + fleet.drivers.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { CreateModal, FormField, FormRow } from './CreateModal';
import { FormInput, FormSelect } from './FormInput';
import { driverApi, type Fleet } from '../services';
import { fleetApi } from '../services/fleetApi';
import { useTheme } from '../context/ThemeContext';

interface CreateDriverModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    fleets?: Fleet[];
}

const STATUS_OPTIONS = [
    { label: 'Actif', value: 'ACTIVE' },
    { label: 'Inactif', value: 'INACTIVE' },
];

export const CreateDriverModal: React.FC<CreateDriverModalProps> = ({
    visible,
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
        username: '',
        email: '',
        password: '',
        phone: '',
        licenseNumber: '',
        status: 'ACTIVE',
        fleetId: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!visible) return;
        if (fleetsProp && fleetsProp.length) {
            setFleets(fleetsProp);
            return;
        }
        fleetApi.getAll()
            .then((data) => setFleets(data))
            .catch(() => setFleets([]));
    }, [visible, fleetsProp]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
        if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
        if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
        if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
        if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'Le numéro de permis est requis';
        if (!formData.fleetId) newErrors.fleetId = 'La flotte est obligatoire';
        if (formData.password && formData.password.length < 8) {
            newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            await driverApi.create({
                fleetId: formData.fleetId,
                driverFirstName: formData.firstName.trim(),
                driverLastName: formData.lastName.trim(),
                driverEmail: formData.email.trim(),
                driverPassword: formData.password,
                driverPhoneNumber: formData.phone.trim(),
                driverLicenseNumber: formData.licenseNumber.trim(),
                username: formData.username.trim() || undefined,
                driverStatus: formData.status,
            });
            Alert.alert(t('common.success'), t('createDriver.success') || 'Chauffeur créé');
            resetForm();
            onSuccess();
            onClose();
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message || t('createDriver.error') || 'Création impossible');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            password: '',
            phone: '',
            licenseNumber: '',
            status: 'ACTIVE',
            fleetId: '',
        });
        setErrors({});
    };

    return (
        <CreateModal
            visible={visible}
            onClose={() => { resetForm(); onClose(); }}
            title="Nouveau chauffeur"
            onSubmit={handleSubmit}
            loading={loading}
        >
            <View style={[styles.infoBox, { backgroundColor: colors.surfaceGlass }]}>
                <Ionicons name="person-add-outline" size={20} color={colors.primaryBlue} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    Compte (users) + profil chauffeur (permis, flotte, statut).
                </Text>
            </View>

            <FormRow>
                <FormField label="Prénom" required halfWidth>
                    <FormInput
                        placeholder="Jean"
                        value={formData.firstName}
                        onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                        error={errors.firstName}
                    />
                </FormField>
                <FormField label="Nom" required halfWidth>
                    <FormInput
                        placeholder="Dupont"
                        value={formData.lastName}
                        onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                        error={errors.lastName}
                    />
                </FormField>
            </FormRow>

            <FormField label="Nom d'utilisateur">
                <FormInput
                    placeholder="jean.dupont (généré si vide)"
                    value={formData.username}
                    onChangeText={(text) => setFormData({ ...formData, username: text })}
                    autoCapitalize="none"
                />
            </FormField>

            <FormField label="Email" required>
                <FormInput
                    placeholder="email@exemple.com"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                />
            </FormField>

            <FormField label="Mot de passe">
                <FormInput
                    placeholder="Optionnel — mot de passe de démo sinon"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    isPassword
                    error={errors.password}
                />
            </FormField>

            <FormRow>
                <FormField label="Téléphone" required halfWidth>
                    <FormInput
                        placeholder="+237 6XX XXX XXX"
                        value={formData.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text.replace(/[^0-9+]/g, '') })}
                        keyboardType="phone-pad"
                        error={errors.phone}
                    />
                </FormField>
                <FormField label="N° de permis" required halfWidth>
                    <FormInput
                        placeholder="Permis"
                        value={formData.licenseNumber}
                        onChangeText={(text) => setFormData({ ...formData, licenseNumber: text })}
                        error={errors.licenseNumber}
                    />
                </FormField>
            </FormRow>

            <FormField label="Flotte" required zIndex={500}>
                <FormSelect
                    value={formData.fleetId}
                    options={[
                        { label: 'Sélectionner une flotte', value: '' },
                        ...fleets.map((f) => ({ label: f.fleetName, value: f.fleetId.toString() })),
                    ]}
                    onSelect={(value) => setFormData({ ...formData, fleetId: value })}
                    error={errors.fleetId}
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
        padding: 12,
        borderRadius: 10,
        marginBottom: 16,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
    },
});

export default CreateDriverModal;

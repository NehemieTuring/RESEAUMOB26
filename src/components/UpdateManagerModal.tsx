/**
 * FleetMan Mobile - Update Manager Modal
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { CreateModal, FormField } from './CreateModal';
import { FormInput, FormSelect } from './FormInput';
import { fleetManagerApi, FleetManager } from '../services';
import { useTheme } from '../context/ThemeContext';
import { Gender, Language } from '../types';

interface UpdateManagerModalProps {
    visible: boolean;
    manager: FleetManager | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const UpdateManagerModal: React.FC<UpdateManagerModalProps> = ({
    visible,
    manager,
    onClose,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);

    const GENDER_OPTIONS = [
        { label: 'Homme', value: Gender.MALE },
        { label: 'Femme', value: Gender.FEMALE },
    ];

    const LANGUAGE_OPTIONS = [
        { label: 'Français', value: Language.FR },
        { label: 'English', value: Language.ENG },
    ];

    const [formData, setFormData] = useState({
        managerFirstName: '',
        managerLastName: '',
        managerPhoneNumber: '',
        gender: Gender.MALE,
        managerIdCardNumber: '',
        niu: '',
        personalAddress: '',
        personalCity: '',
        personalPostalCode: '',
        personalCountry: '',
        taxNumber: '',
        language: Language.FR,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (manager) {
            setFormData({
                managerFirstName: manager.managerFirstName,
                managerLastName: manager.managerLastName,
                managerPhoneNumber: manager.managerPhoneNumber || '',
                gender: manager.gender || Gender.MALE,
                managerIdCardNumber: manager.managerIdCardNumber || '',
                niu: manager.niu || '',
                personalAddress: manager.personalAddress || '',
                personalCity: manager.personalCity || '',
                personalPostalCode: manager.personalPostalCode || '',
                personalCountry: manager.personalCountry || '',
                taxNumber: manager.taxNumber || '',
                language: manager.language || Language.FR,
            });
        }
    }, [manager]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.managerFirstName.trim()) newErrors.managerFirstName = 'Le prénom est requis';
        if (!formData.managerLastName.trim()) newErrors.managerLastName = 'Le nom est requis';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate() || !manager) return;

        setLoading(true);
        try {
            await fleetManagerApi.update(manager.managerId, {
                managerFirstName: formData.managerFirstName,
                managerLastName: formData.managerLastName,
                managerPhoneNumber: formData.managerPhoneNumber || undefined,
                gender: formData.gender,
                managerIdCardNumber: formData.managerIdCardNumber || undefined,
                niu: formData.niu || undefined,
                personalAddress: formData.personalAddress || undefined,
                personalCity: formData.personalCity || undefined,
                personalPostalCode: formData.personalPostalCode || undefined,
                personalCountry: formData.personalCountry || undefined,
                taxNumber: formData.taxNumber || undefined,
                language: formData.language,
            });

            Alert.alert(t('common.success'), 'Le gestionnaire a été mis à jour avec succès.');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating manager:', error);
            Alert.alert(t('common.error'), error.message || 'Une erreur est survenue lors de la mise à jour.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <CreateModal
            visible={visible}
            onClose={onClose}
            title="Modifier le Gestionnaire"
            onSubmit={handleSubmit}
            loading={loading}
            submitText="Enregistrer les modifications"
            cancelText="Annuler"
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={[styles.infoBox, { backgroundColor: colors.surfaceGlass }]}>
                    <Ionicons name="person-outline" size={20} color={colors.primaryBlue} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        Mettez à jour les informations de {manager?.managerFirstName} {manager?.managerLastName}.
                    </Text>
                </View>

                <View style={[styles.formRow, { zIndex: 2000 }]}>
                    <View style={{ flex: 1 }}>
                        <FormField label="Prénom *" required>
                            <FormInput
                                placeholder="Prénom"
                                value={formData.managerFirstName}
                                onChangeText={(text) => setFormData({ ...formData, managerFirstName: text })}
                                error={errors.managerFirstName}
                            />
                        </FormField>
                    </View>
                    <View style={{ flex: 1 }}>
                        <FormField label="Nom *" required>
                            <FormInput
                                placeholder="Nom"
                                value={formData.managerLastName}
                                onChangeText={(text) => setFormData({ ...formData, managerLastName: text })}
                                error={errors.managerLastName}
                            />
                        </FormField>
                    </View>
                </View>

                <View style={[styles.formRow, { zIndex: 1000 }]}>
                    <View style={{ flex: 1, zIndex: 1 }}>
                        <FormField label="Téléphone">
                            <FormInput
                                placeholder="+237 ..."
                                value={formData.managerPhoneNumber}
                                onChangeText={(text) => setFormData({ ...formData, managerPhoneNumber: text.replace(/[^0-9+]/g, '') })}
                                keyboardType="phone-pad"
                            />
                        </FormField>
                    </View>
                    <View style={{ flex: 1, zIndex: 1000 }}>
                        <FormField label="Genre">
                            <FormSelect
                                value={formData.gender}
                                options={GENDER_OPTIONS}
                                onSelect={(value) => setFormData({ ...formData, gender: value as Gender })}
                                zIndex={1000}
                            />
                        </FormField>
                    </View>
                </View>

                <View style={[styles.formRow, { zIndex: 800 }]}>
                    <View style={{ flex: 1 }}>
                        <FormField label="Numéro de carte d'identité">
                            <FormInput
                                placeholder="N° CNI"
                                value={formData.managerIdCardNumber}
                                onChangeText={(text) => setFormData({ ...formData, managerIdCardNumber: text })}
                            />
                        </FormField>
                    </View>
                    <View style={{ flex: 1 }}>
                        <FormField label="NIU">
                            <FormInput
                                placeholder="N° NIU"
                                value={formData.niu}
                                onChangeText={(text) => setFormData({ ...formData, niu: text })}
                            />
                        </FormField>
                    </View>
                </View>

                <View style={{ zIndex: 700 }}>
                    <FormField label="Adresse">
                        <FormInput
                            placeholder="Adresse complète"
                            value={formData.personalAddress}
                            onChangeText={(text) => setFormData({ ...formData, personalAddress: text })}
                        />
                    </FormField>
                </View>

                <View style={[styles.formRow, { zIndex: 600 }]}>
                    <View style={{ flex: 1 }}>
                        <FormField label="Ville">
                            <FormInput
                                placeholder="Ville"
                                value={formData.personalCity}
                                onChangeText={(text) => setFormData({ ...formData, personalCity: text })}
                            />
                        </FormField>
                    </View>
                    <View style={{ flex: 1 }}>
                        <FormField label="Pays">
                            <FormInput
                                placeholder="Cameroun"
                                value={formData.personalCountry}
                                onChangeText={(text) => setFormData({ ...formData, personalCountry: text })}
                            />
                        </FormField>
                    </View>
                </View>

                <View style={{ zIndex: 500 }}>
                    <FormField label="Langue préférée">
                        <FormSelect
                            value={formData.language}
                            options={LANGUAGE_OPTIONS}
                            onSelect={(value) => setFormData({ ...formData, language: value as Language })}
                            zIndex={500}
                            openDirection="up"
                        />
                    </FormField>
                </View>
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
});

export default UpdateManagerModal;

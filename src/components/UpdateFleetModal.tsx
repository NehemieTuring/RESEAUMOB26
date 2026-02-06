/**
 * FleetMan Mobile - Update Fleet Modal
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { CreateModal, FormField } from './CreateModal';
import { FormInput, FormSelect } from './FormInput';
import { fleetApi, Fleet } from '../services';
import { useTheme } from '../context/ThemeContext';

interface UpdateFleetModalProps {
    visible: boolean;
    fleet: Fleet | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const UpdateFleetModal: React.FC<UpdateFleetModalProps> = ({
    visible,
    fleet,
    onClose,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);

    const FLEET_TYPES = [
        { label: 'Personnel', value: 'PERSONAL' },
        { label: 'Transport de passagers', value: 'PASSENGER_TRANSPORT' },
        { label: 'Transport de marchandises', value: 'CARGO_TRANSPORT' },
        { label: 'Livraison', value: 'DELIVERY' },
        { label: 'Location', value: 'RENTAL' },
        { label: 'Mixte', value: 'MIXED' },
        { label: 'Autre', value: 'OTHER' },
    ];

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        fleetType: 'DELIVERY',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (fleet) {
            setFormData({
                name: fleet.fleetName,
                description: fleet.fleetDescription || '',
                fleetType: fleet.fleetType,
            });
        }
    }, [fleet]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate() || !fleet) return;

        setLoading(true);
        try {
            await fleetApi.update(fleet.fleetId, {
                fleetName: formData.name,
                fleetDescription: formData.description || undefined,
                fleetType: formData.fleetType,
            });

            Alert.alert(t('common.success'), 'La flotte a été mise à jour avec succès.');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating fleet:', error);
            Alert.alert(t('common.error'), error.message || 'Une erreur est survenue lors de la mise à jour.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <CreateModal
            visible={visible}
            onClose={onClose}
            title="Modifier la Flotte"
            onSubmit={handleSubmit}
            loading={loading}
            submitText="Enregistrer les modifications"
            cancelText="Annuler"
        >
            <View style={[styles.infoBox, { backgroundColor: colors.surfaceGlass }]}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primaryBlue} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    Modifiez les informations générales de votre flotte.
                </Text>
            </View>

            <FormField label="Nom de la flotte *" required>
                <FormInput
                    placeholder="Entrez le nom de la flotte"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    error={errors.name}
                />
            </FormField>

            <FormField label="Description">
                <FormInput
                    placeholder="Description de la flotte"
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    multiline
                    numberOfLines={3}
                    style={{ minHeight: 80, textAlignVertical: 'top' }}
                />
            </FormField>

            <FormField label="Type de flotte" zIndex={1000}>
                <FormSelect
                    value={formData.fleetType}
                    options={FLEET_TYPES}
                    onSelect={(value) => setFormData({ ...formData, fleetType: value })}
                    zIndex={1000}
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

export default UpdateFleetModal;

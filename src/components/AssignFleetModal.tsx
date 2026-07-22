import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CreateModal, FormField } from './CreateModal';
import { FormSelect } from './FormInput';
import { vehicleApi, Vehicle, Fleet } from '../services';
import { useTheme } from '../context/ThemeContext';

interface AssignFleetModalProps {
    visible: boolean;
    vehicle: Vehicle | null;
    fleets: Fleet[];
    onClose: () => void;
    onSuccess: () => void;
}

export const AssignFleetModal: React.FC<AssignFleetModalProps> = ({
    visible,
    vehicle,
    fleets,
    onClose,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);
    const [selectedFleetId, setSelectedFleetId] = useState('');

    const fleetOptions = fleets.map(f => ({
        label: f.fleetName,
        value: f.fleetId
    }));

    const handleSubmit = async () => {
        if (!selectedFleetId) {
            Alert.alert('Erreur', 'Veuillez sélectionner une flotte.');
            return;
        }

        if (!vehicle) return;

        try {
            setLoading(true);
            await vehicleApi.update(vehicle.vehicleId, { fleetId: selectedFleetId });
            onSuccess();
        } catch (error: any) {
            console.error('Error assigning vehicle to fleet:', error);
            Alert.alert(
                t('common.error'),
                error.message || 'Erreur lors de l\'assignation du véhicule.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <CreateModal
            visible={visible}
            onClose={onClose}
            title={`Assigner ${vehicle?.vehicleMake || ''} ${vehicle?.vehicleModel || ''}`}
            onSubmit={handleSubmit}
            loading={loading}
        >
            <View style={[styles.infoBox, { backgroundColor: colors.surfaceGlass }]}>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    Choisissez la flotte à laquelle vous souhaitez assigner ce véhicule.
                </Text>
            </View>

            <FormField label="Flotte de destination" required>
                <FormSelect
                    value={selectedFleetId}
                    onSelect={setSelectedFleetId}
                    options={[{ label: 'Sélectionner une flotte...', value: '' }, ...fleetOptions]}
                />
            </FormField>
        </CreateModal>
    );
};

const styles = StyleSheet.create({
    infoBox: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
    },
});

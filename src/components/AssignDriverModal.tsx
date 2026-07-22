import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CreateModal, FormField } from './CreateModal';
import { FormSelect } from './FormInput';
import { driverApi, Vehicle, Driver } from '../services';
import { useTheme } from '../context/ThemeContext';

interface AssignDriverModalProps {
    visible: boolean;
    vehicle: Vehicle | null;
    drivers: Driver[];
    onClose: () => void;
    onSuccess: () => void;
}

export const AssignDriverModal: React.FC<AssignDriverModalProps> = ({
    visible,
    vehicle,
    drivers,
    onClose,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);
    const [selectedDriverId, setSelectedDriverId] = useState('');

    const driverOptions = drivers.map(d => ({
        label: `${d.driverFirstName} ${d.driverLastName}`,
        value: d.driverId
    }));

    const handleSubmit = async () => {
        if (!selectedDriverId) {
            Alert.alert('Erreur', 'Veuillez sélectionner un chauffeur.');
            return;
        }

        if (!vehicle) return;

        try {
            setLoading(true);
            await driverApi.assignVehicle(selectedDriverId, vehicle.vehicleId);
            onSuccess();
        } catch (error: any) {
            console.error('Error assigning vehicle to driver:', error);
            Alert.alert(
                t('common.error'),
                error.message || 'Erreur lors de l\'assignation au chauffeur.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <CreateModal
            visible={visible}
            onClose={onClose}
            title={`Assigner à un chauffeur`}
            onSubmit={handleSubmit}
            loading={loading}
        >
            <View style={[styles.infoBox, { backgroundColor: colors.surfaceGlass }]}>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    Choisissez le chauffeur auquel vous souhaitez assigner ce véhicule ({vehicle?.vehicleMake} {vehicle?.vehicleModel}).
                </Text>
            </View>

            <FormField label="Chauffeur" required>
                <FormSelect
                    value={selectedDriverId}
                    onSelect={setSelectedDriverId}
                    options={[{ label: 'Sélectionner un chauffeur...', value: '' }, ...driverOptions]}
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

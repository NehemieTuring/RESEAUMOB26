/**
 * FleetMan Mobile - Update Vehicle Modal
 * Modal form to update an existing vehicle
 */

import React, { useState, useEffect } from 'react';
import { Alert, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { CreateModal, FormField, FormRow } from './CreateModal';
import { FormInput, FormSelect } from './FormInput';
import { vehicleApi, Vehicle } from '../services';
import { useTheme } from '../context/ThemeContext';

interface UpdateVehicleModalProps {
    visible: boolean;
    vehicle: Vehicle | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const UpdateVehicleModal: React.FC<UpdateVehicleModalProps> = ({
    visible,
    vehicle,
    onClose,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);

    const VEHICLE_TYPES = [
        { label: t('createVehicle.typeCar'), value: 'CAR' },
        { label: t('createVehicle.typeTruck'), value: 'TRUCK' },
        { label: t('createVehicle.typeMotorcycle'), value: 'MOTORCYCLE' },
        { label: t('createVehicle.typeBus'), value: 'BUS' },
        { label: 'Vélo', value: 'BIKE' },
        { label: 'Tricycle', value: 'TRICYCLE' },
        { label: 'Autre', value: 'OTHER' },
    ];

    const FUEL_TYPES = [
        { label: t('createVehicle.fuelPetrol'), value: 'PETROL' },
        { label: t('createVehicle.fuelDiesel'), value: 'DIESEL' },
        { label: t('createVehicle.fuelElectric'), value: 'ELECTRIC' },
        { label: t('createVehicle.fuelHybrid'), value: 'HYBRID' },
    ];

    const VEHICLE_STATES = [
        { label: 'En service', value: 'IN_SERVICE' },
        { label: 'Hors service', value: 'OUT_OF_SERVICE' },
        { label: 'En maintenance', value: 'UNDER_MAINTENANCE' },
        { label: 'Garé', value: 'PARKED' },
        { label: 'En alerte', value: 'IN_ALARM' },
    ];

    const [formData, setFormData] = useState({
        make: '',
        model: '',
        registrationNumber: '',
        vehicleType: 'CAR',
        fuelType: 'PETROL',
        state: 'IN_SERVICE',
        passengerCapacity: '5',
        fuelLevel: '100',
    });

    useEffect(() => {
        if (vehicle) {
            setFormData({
                make: vehicle.vehicleMake || '',
                model: vehicle.vehicleModel || '',
                registrationNumber: vehicle.vehicleRegistrationNumber || '',
                vehicleType: vehicle.type || 'CAR',
                fuelType: vehicle.fuelType || 'PETROL',
                state: vehicle.state || 'IN_SERVICE',
                passengerCapacity: String(vehicle.numberOfPassengers || 5),
                fuelLevel: String(vehicle.fuelLevel || 100),
            });
        }
    }, [vehicle]);

    const handleSubmit = async () => {
        if (!vehicle) return;

        setLoading(true);
        try {
            await vehicleApi.update(vehicle.vehicleId, {
                vehicleMake: formData.make,
                vehicleModel: formData.model,
                type: formData.vehicleType,
                fuelLevel: parseInt(formData.fuelLevel) || 100,
                numberOfPassengers: parseInt(formData.passengerCapacity) || 5,
                state: formData.state,
                fuelType: formData.fuelType,
            });

            Alert.alert(t('common.success'), 'Véhicule mis à jour avec succès');
            onSuccess();
            onClose();
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message || 'Erreur lors de la mise à jour');
        } finally {
            setLoading(false);
        }
    };

    return (
        <CreateModal
            visible={visible}
            onClose={onClose}
            title="Modifier le véhicule"
            onSubmit={handleSubmit}
            loading={loading}
        >
            <View style={[styles.infoBox, { backgroundColor: colors.surfaceGlass }]}>
                <Ionicons name="car-outline" size={20} color={colors.primaryBlue} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    Modifiez les informations du véhicule
                </Text>
            </View>

            <FormRow zIndex={50}>
                <FormField label="Marque" required halfWidth>
                    <FormInput
                        placeholder="Ex: Toyota"
                        value={formData.make}
                        onChangeText={(text) => setFormData({ ...formData, make: text })}
                    />
                </FormField>
                <FormField label="Modèle" required halfWidth>
                    <FormInput
                        placeholder="Ex: Corolla"
                        value={formData.model}
                        onChangeText={(text) => setFormData({ ...formData, model: text })}
                    />
                </FormField>
            </FormRow>

            <View style={{ zIndex: 40 }}>
                <FormField label="Immatriculation (non modifiable)">
                    <FormInput
                        placeholder="Ex: AB-123-CD"
                        value={formData.registrationNumber}
                        editable={false}
                        style={{ opacity: 0.6 }}
                    />
                </FormField>
            </View>

            <FormRow zIndex={1000}>
                <FormField label="Type" halfWidth zIndex={1000}>
                    <FormSelect
                        value={formData.vehicleType}
                        options={VEHICLE_TYPES}
                        onSelect={(value) => setFormData({ ...formData, vehicleType: value })}
                        zIndex={1000}
                    />
                </FormField>
                <FormField label="Carburant" halfWidth zIndex={900}>
                    <FormSelect
                        value={formData.fuelType}
                        options={FUEL_TYPES}
                        onSelect={(value) => setFormData({ ...formData, fuelType: value })}
                        zIndex={900}
                    />
                </FormField>
            </FormRow>

            <FormRow zIndex={500}>
                <FormField label="Passagers" halfWidth>
                    <FormInput
                        placeholder="5"
                        value={formData.passengerCapacity}
                        onChangeText={(text) => setFormData({ ...formData, passengerCapacity: text })}
                        keyboardType="numeric"
                    />
                </FormField>
                <FormField label="Niveau carburant (%)" halfWidth>
                    <FormInput
                        placeholder="100"
                        value={formData.fuelLevel}
                        onChangeText={(text) => setFormData({ ...formData, fuelLevel: text })}
                        keyboardType="numeric"
                    />
                </FormField>
            </FormRow>

            <View style={{ zIndex: 100 }}>
                <FormField label="État">
                    <FormSelect
                        value={formData.state}
                        options={VEHICLE_STATES}
                        onSelect={(value) => setFormData({ ...formData, state: value })}
                        zIndex={100}
                        openDirection="up"
                    />
                </FormField>
            </View>
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

export default UpdateVehicleModal;

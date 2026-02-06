/**
 * FleetMan Mobile - Create Vehicle Modal
 * Modal form to create a new vehicle with theme and i18n support
 */

import React, { useState, useEffect } from 'react';
import { Alert, View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { CreateModal, FormField, FormRow } from './CreateModal';
import { FormInput, FormSelect } from './FormInput';
import { vehicleApi, fleetApi, Fleet } from '../services';
import { useTheme } from '../context/ThemeContext';

interface CreateVehicleModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateVehicleModal: React.FC<CreateVehicleModalProps> = ({
    visible,
    onClose,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);
    const [fleets, setFleets] = useState<Fleet[]>([]);

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
        { label: t('createVehicle.stateInService'), value: 'IN_SERVICE' },
        { label: t('createVehicle.stateOutOfService'), value: 'OUT_OF_SERVICE' },
        { label: t('createVehicle.stateMaintenance'), value: 'UNDER_MAINTENANCE' },
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
        fleetId: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (visible) {
            loadFleets();
        }
    }, [visible]);

    const loadFleets = async () => {
        try {
            // Get the adminId of the connected user
            const userStr = await AsyncStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const adminId = user?.adminId;

            // Fetch only fleets for this admin
            const data = await fleetApi.getAll(adminId);
            setFleets(data);
            if (data.length > 0 && !formData.fleetId) {
                setFormData(prev => ({ ...prev, fleetId: data[0].fleetId.toString() }));
            }
        } catch (error) {
            console.error('Error loading fleets:', error);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.make.trim()) {
            newErrors.make = t('validation.makeRequired');
        }
        if (!formData.model.trim()) {
            newErrors.model = t('validation.modelRequired');
        }
        if (!formData.registrationNumber.trim()) {
            newErrors.registrationNumber = t('validation.registrationRequired');
        }
        if (!formData.fleetId) {
            newErrors.fleetId = t('validation.fleetRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await vehicleApi.create({
                vehicleMake: formData.make,
                vehicleModel: formData.model,
                vehicleRegistrationNumber: formData.registrationNumber,
                type: formData.vehicleType,
                fuelLevel: parseInt(formData.fuelLevel) || 100,
                numberOfPassengers: parseInt(formData.passengerCapacity) || 5,
                state: formData.state,
                fuelType: formData.fuelType,
                fleetId: parseInt(formData.fleetId),
            });

            Alert.alert(t('common.success'), t('createVehicle.success'));
            resetForm();
            onSuccess();
            onClose();
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message || t('createVehicle.error'));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            make: '',
            model: '',
            registrationNumber: '',
            vehicleType: 'CAR',
            fuelType: 'PETROL',
            state: 'IN_SERVICE',
            passengerCapacity: '5',
            fuelLevel: '100',
            fleetId: fleets.length > 0 ? fleets[0].fleetId.toString() : '',
        });
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <CreateModal
            visible={visible}
            onClose={handleClose}
            title={t('createVehicle.title')}
            onSubmit={handleSubmit}
            loading={loading}
        >
            <View style={[styles.infoBox, { backgroundColor: colors.surfaceGlass }]}>
                <Ionicons name="car-outline" size={20} color={colors.primaryBlue} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    {t('createVehicle.subtitle')}
                </Text>
            </View>

            <FormRow>
                <FormField label={t('createVehicle.make')} required halfWidth>
                    <FormInput
                        placeholder="Ex: Toyota"
                        value={formData.make}
                        onChangeText={(text) => setFormData({ ...formData, make: text })}
                        error={errors.make}
                    />
                </FormField>
                <FormField label={t('createVehicle.model')} required halfWidth>
                    <FormInput
                        placeholder="Ex: Corolla"
                        value={formData.model}
                        onChangeText={(text) => setFormData({ ...formData, model: text })}
                        error={errors.model}
                    />
                </FormField>
            </FormRow>

            <FormField label={t('createVehicle.registration')} required>
                <FormInput
                    placeholder="Ex: AB-123-CD"
                    value={formData.registrationNumber}
                    onChangeText={(text) => setFormData({ ...formData, registrationNumber: text })}
                    autoCapitalize="characters"
                    error={errors.registrationNumber}
                />
            </FormField>

            <FormRow zIndex={1000}>
                <FormField label={t('createVehicle.type')} halfWidth zIndex={1000}>
                    <FormSelect
                        value={formData.vehicleType}
                        options={VEHICLE_TYPES}
                        onSelect={(value) => setFormData({ ...formData, vehicleType: value })}
                        zIndex={1000}
                    />
                </FormField>
                <FormField label={t('createVehicle.fuelType')} halfWidth zIndex={900}>
                    <FormSelect
                        value={formData.fuelType}
                        options={FUEL_TYPES}
                        onSelect={(value) => setFormData({ ...formData, fuelType: value })}
                        zIndex={900}
                    />
                </FormField>
            </FormRow>

            <FormRow zIndex={30}>
                <FormField label={t('createVehicle.passengers')} halfWidth>
                    <FormInput
                        placeholder="5"
                        value={formData.passengerCapacity}
                        onChangeText={(text) => setFormData({ ...formData, passengerCapacity: text })}
                        keyboardType="numeric"
                    />
                </FormField>
                <FormField label={t('createVehicle.fuelLevel')} halfWidth>
                    <FormInput
                        placeholder="100"
                        value={formData.fuelLevel}
                        onChangeText={(text) => setFormData({ ...formData, fuelLevel: text })}
                        keyboardType="numeric"
                    />
                </FormField>
            </FormRow>

            <FormField label={t('createVehicle.fleet')} required zIndex={500}>
                <FormSelect
                    value={formData.fleetId}
                    options={fleets.map(f => ({ label: f.fleetName, value: f.fleetId.toString() }))}
                    onSelect={(value) => setFormData({ ...formData, fleetId: value })}
                    error={errors.fleetId}
                    zIndex={500}
                    openDirection="up"
                />
            </FormField>

            <FormField label={t('createVehicle.initialState')} zIndex={400}>
                <FormSelect
                    value={formData.state}
                    options={VEHICLE_STATES}
                    onSelect={(value) => setFormData({ ...formData, state: value })}
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

export default CreateVehicleModal;

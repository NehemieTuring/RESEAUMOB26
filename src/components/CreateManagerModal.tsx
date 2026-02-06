/**
 * FleetMan Mobile - Create Manager Modal
 * Modal form to create a new fleet manager with theme and i18n support
 */

import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { CreateModal, FormField, FormRow } from './CreateModal';
import { FormInput, FormSelect } from './FormInput';
import { fleetManagerApi } from '../services';
import { Gender, Language } from '../types';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CreateManagerModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateManagerModal: React.FC<CreateManagerModalProps> = ({
    visible,
    onClose,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);

    const GENDER_OPTIONS = [
        { label: t('form.genderMale'), value: 'MALE' },
        { label: t('form.genderFemale'), value: 'FEMALE' },
    ];

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        gender: 'MALE',
        address: '',
        city: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = t('validation.firstNameRequired');
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = t('validation.lastNameRequired');
        }
        if (!formData.email.trim()) {
            newErrors.email = t('validation.emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = t('validation.emailInvalid');
        }
        if (!formData.password || formData.password.length < 8) {
            newErrors.password = t('validation.passwordMin');
        }
        if (!formData.phone.trim()) {
            newErrors.phone = t('validation.phoneRequired');
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
            // Get current admin user from storage
            const userJson = await AsyncStorage.getItem('user');
            if (!userJson) throw new Error('Utilisateur non connecté');
            const user = JSON.parse(userJson);
            const adminId = user.userId;

            await fleetManagerApi.create(adminId, {
                managerFirstName: formData.firstName,
                managerLastName: formData.lastName,
                managerEmail: formData.email,
                managerPassword: formData.password,
                managerPhoneNumber: formData.phone,
                gender: formData.gender as Gender,
                personalAddress: formData.address || undefined,
                personalCity: formData.city || undefined,
                personalCountry: 'Cameroun', // Default
                language: Language.FR, // Default
            });

            Alert.alert(t('common.success'), t('createManager.success'));
            resetForm();
            onSuccess();
            onClose();
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message || t('createManager.error'));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phone: '',
            gender: 'MALE',
            address: '',
            city: '',
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
            title={t('createManager.title')}
            onSubmit={handleSubmit}
            loading={loading}
        >
            <View style={[styles.infoBox, { backgroundColor: colors.surfaceGlass }]}>
                <Ionicons name="person-add-outline" size={20} color={colors.primaryBlue} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    {t('createManager.subtitle')}
                </Text>
            </View>

            <FormRow>
                <FormField label={t('form.firstName')} required halfWidth>
                    <FormInput
                        placeholder={t('form.firstName')}
                        value={formData.firstName}
                        onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                        error={errors.firstName}
                    />
                </FormField>
                <FormField label={t('form.lastName')} required halfWidth>
                    <FormInput
                        placeholder={t('form.lastName')}
                        value={formData.lastName}
                        onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                        error={errors.lastName}
                    />
                </FormField>
            </FormRow>

            <FormField label={t('form.email')} required>
                <FormInput
                    placeholder="email@example.com"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                />
            </FormField>

            <FormField label={`${t('form.password')} (${t('form.passwordHint')})`} required>
                <FormInput
                    placeholder="••••••••"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    isPassword
                    error={errors.password}
                />
            </FormField>

            <FormRow zIndex={1000}>
                <FormField label={t('form.phone')} required halfWidth>
                    <FormInput
                        placeholder="+237 6XX XXX XXX"
                        value={formData.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                        keyboardType="phone-pad"
                        error={errors.phone}
                    />
                </FormField>
                <FormField label={t('form.gender')} halfWidth zIndex={1000}>
                    <FormSelect
                        value={formData.gender}
                        options={GENDER_OPTIONS}
                        onSelect={(value) => setFormData({ ...formData, gender: value })}
                        zIndex={1000}
                    />
                </FormField>
            </FormRow>

            <FormRow zIndex={1}>
                <FormField label={t('form.address')} halfWidth>
                    <FormInput
                        placeholder={t('form.address')}
                        value={formData.address}
                        onChangeText={(text) => setFormData({ ...formData, address: text })}
                    />
                </FormField>
                <FormField label={t('form.city')} halfWidth>
                    <FormInput
                        placeholder={t('form.city')}
                        value={formData.city}
                        onChangeText={(text) => setFormData({ ...formData, city: text })}
                    />
                </FormField>
            </FormRow>
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

export default CreateManagerModal;

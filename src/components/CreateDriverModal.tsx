/**
 * FleetMan Mobile - Create Driver Modal
 * Modal form to create a new driver with theme and i18n support
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    Alert,
    StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { CreateModal, FormField, FormRow } from './CreateModal';
import { FormInput } from './FormInput';
import { driverApi } from '../services';
import { useTheme } from '../context/ThemeContext';

interface CreateDriverModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateDriverModal: React.FC<CreateDriverModalProps> = ({
    visible,
    onClose,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        licenseNumber: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
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
            // Get adminId from stored user data
            const userStr = await AsyncStorage.getItem('user');
            const userObj = userStr ? JSON.parse(userStr) : null;
            const adminId = userObj?.adminId || userObj?.userId;

            if (!adminId) {
                throw new Error(t('createDriver.noAdminIdError') || 'Impossible de créer un conducteur sans être connecté en tant qu\'administrateur.');
            }

            // Use createAsAdmin which assigns the driver to the Admin's system FleetManager
            await driverApi.createAsAdmin(adminId, {
                driverFirstName: formData.firstName,
                driverLastName: formData.lastName,
                driverEmail: formData.email,
                driverPassword: formData.password,
                driverPhoneNumber: formData.phone,
                driverLicenseNumber: formData.licenseNumber || undefined,
                driverEmergencyContactName: formData.emergencyContactName || undefined,
                driverEmergencyContactPhone: formData.emergencyContactPhone || undefined,
            });

            Alert.alert(t('common.success'), t('createDriver.success'));
            resetForm();
            onSuccess();
            onClose();
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message || t('createDriver.error'));
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
            licenseNumber: '',
            emergencyContactName: '',
            emergencyContactPhone: '',
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
            title={t('createDriver.title')}
            onSubmit={handleSubmit}
            loading={loading}
        >
            <View style={[styles.infoBox, { backgroundColor: colors.surfaceGlass }]}>
                <Ionicons name="person-add-outline" size={20} color={colors.primaryBlue} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    {t('createDriver.subtitle')}
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

            <FormRow>
                <FormField label={t('form.phone')} required halfWidth>
                    <FormInput
                        placeholder="+237 6XX XXX XXX"
                        value={formData.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text.replace(/[^0-9+]/g, '') })}
                        keyboardType="phone-pad"
                        error={errors.phone}
                    />
                </FormField>
                <FormField label={t('createDriver.licenseNumber')} halfWidth>
                    <FormInput
                        placeholder={t('createDriver.licenseNumber')}
                        value={formData.licenseNumber}
                        onChangeText={(text) => setFormData({ ...formData, licenseNumber: text })}
                    />
                </FormField>
            </FormRow>

            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                {t('createDriver.emergencyContact')}
            </Text>

            <FormRow>
                <FormField label={t('createDriver.emergencyName')} halfWidth>
                    <FormInput
                        placeholder={t('createDriver.emergencyName')}
                        value={formData.emergencyContactName}
                        onChangeText={(text) => setFormData({ ...formData, emergencyContactName: text })}
                    />
                </FormField>
                <FormField label={t('createDriver.emergencyPhone')} halfWidth>
                    <FormInput
                        placeholder={t('form.phone')}
                        value={formData.emergencyContactPhone}
                        onChangeText={(text) => setFormData({ ...formData, emergencyContactPhone: text.replace(/[^0-9+]/g, '') })}
                        keyboardType="phone-pad"
                    />
                </FormField>
            </FormRow>
        </CreateModal>
    );
};

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 12,
    },
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

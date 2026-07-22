/**
 * FleetMan Mobile - Create Fleet Modal
 * Multi-step modal form to create a new fleet with theme and i18n support
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateModal, FormField } from './CreateModal';
import { FormInput, FormSelect } from './FormInput';
import { fleetApi, fleetManagerApi } from '../services';
import { useTheme } from '../context/ThemeContext';
import { Gender, Language } from '../types';

interface CreateFleetModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateFleetModal: React.FC<CreateFleetModalProps> = ({
    visible,
    onClose,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [adminId, setAdminId] = useState<number | null>(null);
    const totalSteps = 2;

    useEffect(() => {
        const getAdminId = async () => {
            try {
                const userStr = await AsyncStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setAdminId(user.adminId || 1);
                }
            } catch (error) {
                console.error('Error getting adminId:', error);
                setAdminId(1);
            }
        };
        getAdminId();
    }, []);

    const FLEET_TYPES = [
        { label: 'Personnel', value: 'PERSONAL' },
        { label: 'Transport de passagers', value: 'PASSENGER_TRANSPORT' },
        { label: 'Transport de marchandises', value: 'CARGO_TRANSPORT' },
        { label: 'Livraison', value: 'DELIVERY' },
        { label: 'Location', value: 'RENTAL' },
        { label: 'Mixte', value: 'MIXED' },
        { label: 'Autre', value: 'OTHER' },
    ];

    const GENDER_OPTIONS = [
        { label: 'Homme', value: Gender.MALE },
        { label: 'Femme', value: Gender.FEMALE },
    ];

    const LANGUAGE_OPTIONS = [
        { label: 'Français', value: Language.FR },
        { label: 'English', value: Language.ENG },
    ];

    const [formData, setFormData] = useState({
        // Fleet Data
        name: '',
        description: '',
        fleetType: 'DELIVERY',

        // Manager Data
        managerFirstName: '',
        managerLastName: '',
        managerEmail: '',
        managerPassword: '',
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

    const validateStep1 = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = t('validation.fleetNameRequired') || 'Le nom est requis';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSubmit = async () => {
        if (step < totalSteps) {
            handleNext();
            return;
        }

        setLoading(true);
        try {
            // Créer la flotte (le backend la rattache au gestionnaire connecte)
            await fleetApi.create({
                fleetName: formData.name,
                fleetDescription: formData.description || undefined,
                fleetType: formData.fleetType,
            });

            Alert.alert(t('common.success'), 'La flotte a été créée avec succès.');
            resetForm();
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error creating fleet:', error);
            Alert.alert(t('common.error'), error.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            fleetType: 'DELIVERY',
            managerFirstName: '',
            managerLastName: '',
            managerEmail: '',
            managerPassword: '',
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
        setErrors({});
        setStep(1);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const getTitle = () => {
        if (step === 1) return 'Étape 1: Informations de la Flotte';
        return 'Étape 2: Confirmation';
    };

    const getSubmitText = () => {
        if (step === 1) return 'Suivant →';
        return 'Créer la Flotte';
    };

    const getCancelText = () => {
        return step > 1 ? '← Retour' : 'Annuler';
    };

    return (
        <CreateModal
            visible={visible}
            onClose={handleClose}
            title={getTitle()}
            onSubmit={handleSubmit}
            loading={loading}
            submitText={getSubmitText()}
            cancelText={getCancelText()}
            step={step}
            totalSteps={totalSteps}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 150 }}
            >
                {step === 1 && (
                    <>
                        <View style={[styles.stepDescription, { backgroundColor: colors.surfaceGlass }]}>
                            <Ionicons name="business-outline" size={20} color={colors.primaryBlue} />
                            <Text style={[styles.stepDescriptionText, { color: colors.textSecondary }]}>
                                Définissez les informations de votre nouvelle flotte
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
                    </>
                )}

                {step === 2 && (
                    <>
                        <View style={[styles.stepDescription, { backgroundColor: colors.surfaceGlass }]}>
                            <Ionicons name="checkmark-circle-outline" size={20} color={colors.successText} />
                            <Text style={[styles.stepDescriptionText, { color: colors.textSecondary }]}>
                                Vérifiez les informations avant de créer
                            </Text>
                        </View>

                        <View style={[styles.summaryCard, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                            <Text style={[styles.summarySectionTitle, { color: colors.primaryBlue }]}>
                                <Ionicons name="grid" size={16} /> Flotte
                            </Text>
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Nom:</Text>
                                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{formData.name}</Text>
                                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Type:</Text>
                                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                                    {FLEET_TYPES.find(v => v.value === formData.fleetType)?.label}
                                </Text>
                            </View>
                            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Description:</Text>
                            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{formData.description || 'N/A'}</Text>
                        </View>

                        <View style={[styles.infoBox, { backgroundColor: colors.infoBg, borderColor: colors.infoBorder }]}>
                            <Ionicons name="information-circle" size={20} color={colors.infoText} />
                            <Text style={[styles.infoText, { color: colors.infoText }]}>
                                En cliquant sur "Créer", vous allez créer la flotte. En tant qu'administrateur, vous en serez le gestionnaire par défaut.
                            </Text>
                        </View>
                    </>
                )}
            </ScrollView>

            <Text style={[styles.requiredNote, { color: colors.textMuted, marginTop: 10 }]}>
                * Champs obligatoires
            </Text>
        </CreateModal>
    );
};

const styles = StyleSheet.create({
    stepDescription: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
        padding: 12,
        borderRadius: 10,
    },
    stepDescriptionText: {
        flex: 1,
        fontSize: 14,
    },
    formRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 10,
    },
    requiredNote: {
        fontSize: 12,
        marginTop: 8,
    },
    summaryCard: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    summarySectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    summaryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
        gap: 8,
    },
    summaryLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 13,
        marginRight: 10,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
});

export default CreateFleetModal;

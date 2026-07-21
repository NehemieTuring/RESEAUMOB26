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
    const totalSteps = 3;

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

    const validateStep2 = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.managerFirstName.trim()) newErrors.managerFirstName = 'Le prénom est requis';
        if (!formData.managerLastName.trim()) newErrors.managerLastName = 'Le nom est requis';
        if (!formData.managerEmail.trim()) newErrors.managerEmail = 'L\'email est requis';
        if (!formData.managerPassword.trim()) newErrors.managerPassword = 'Le mot de passe est requis';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
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

        if (!adminId) {
            Alert.alert(t('common.error'), "Impossible d'identifier l'administrateur.");
            return;
        }

        setLoading(true);
        try {
            // 1. Créer le Fleet Manager
            const manager = await fleetManagerApi.create(adminId, {
                managerFirstName: formData.managerFirstName,
                managerLastName: formData.managerLastName,
                managerEmail: formData.managerEmail,
                managerPassword: formData.managerPassword,
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

            // 2. Creer la flotte (le backend la rattache au gestionnaire connecte)
            await fleetApi.create({
                fleetName: formData.name,
                fleetDescription: formData.description || undefined,
                fleetType: formData.fleetType,
            });

            Alert.alert(t('common.success'), 'La flotte et son gestionnaire ont été créés avec succès.');
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
        if (step === 2) return 'Étape 2: Gestionnaire de la Flotte';
        return 'Étape 3: Confirmation';
    };

    const getSubmitText = () => {
        if (step === 1) return 'Suivant →';
        if (step === 2) return 'Suivant →';
        return 'Créer la Flotte et le Gestionnaire';
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
                            <Ionicons name="person-add-outline" size={20} color={colors.primaryBlue} />
                            <Text style={[styles.stepDescriptionText, { color: colors.textSecondary }]}>
                                Créez le gestionnaire qui sera responsable de cette flotte
                            </Text>
                        </View>

                        <View style={styles.formRow}>
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

                        <FormField label="Email *" required>
                            <FormInput
                                placeholder="email@exemple.com"
                                value={formData.managerEmail}
                                onChangeText={(text) => setFormData({ ...formData, managerEmail: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                error={errors.managerEmail}
                            />
                        </FormField>

                        <FormField label="Mot de passe *" required>
                            <FormInput
                                placeholder="••••••••••••"
                                value={formData.managerPassword}
                                onChangeText={(text) => setFormData({ ...formData, managerPassword: text })}
                                secureTextEntry
                                error={errors.managerPassword}
                            />
                        </FormField>

                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Informations optionnelles</Text>

                        <View style={[styles.formRow, { zIndex: 1000 }]}>
                            <View style={{ flex: 1 }}>
                                <FormField label="Téléphone">
                                    <FormInput
                                        placeholder="+237 ..."
                                        value={formData.managerPhoneNumber}
                                        onChangeText={(text) => setFormData({ ...formData, managerPhoneNumber: text.replace(/[^0-9+]/g, '') })}
                                        keyboardType="phone-pad"
                                    />
                                </FormField>
                            </View>
                            <View style={{ flex: 1 }}>
                                <FormField label="Genre" zIndex={1000}>
                                    <FormSelect
                                        value={formData.gender}
                                        options={GENDER_OPTIONS}
                                        onSelect={(value) => setFormData({ ...formData, gender: value as Gender })}
                                        zIndex={1000}
                                    />
                                </FormField>
                            </View>
                        </View>

                        <View style={styles.formRow}>
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
                                <FormField label="NIU (Numéro Unique)">
                                    <FormInput
                                        placeholder="N° NIU"
                                        value={formData.niu}
                                        onChangeText={(text) => setFormData({ ...formData, niu: text })}
                                    />
                                </FormField>
                            </View>
                        </View>

                        <FormField label="Adresse">
                            <FormInput
                                placeholder="Adresse complète"
                                value={formData.personalAddress}
                                onChangeText={(text) => setFormData({ ...formData, personalAddress: text })}
                            />
                        </FormField>

                        <View style={styles.formRow}>
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
                                <FormField label="Code Postal">
                                    <FormInput
                                        placeholder="B.P."
                                        value={formData.personalPostalCode}
                                        onChangeText={(text) => setFormData({ ...formData, personalPostalCode: text })}
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

                        <View style={[styles.formRow, { zIndex: 500 }]}>
                            <View style={{ flex: 1 }}>
                                <FormField label="Numéro fiscal">
                                    <FormInput
                                        placeholder="N° Fiscal"
                                        value={formData.taxNumber}
                                        onChangeText={(text) => setFormData({ ...formData, taxNumber: text })}
                                    />
                                </FormField>
                            </View>
                            <View style={{ flex: 1 }}>
                                <FormField label="Langue préférée" zIndex={500}>
                                    <FormSelect
                                        value={formData.language}
                                        options={LANGUAGE_OPTIONS}
                                        onSelect={(value) => setFormData({ ...formData, language: value as Language })}
                                        zIndex={500}
                                        openDirection="up"
                                    />
                                </FormField>
                            </View>
                        </View>
                    </>
                )}

                {step === 3 && (
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

                            <View style={{ height: 1, backgroundColor: colors.borderGlass, marginVertical: 12 }} />

                            <Text style={[styles.summarySectionTitle, { color: colors.primaryBlue }]}>
                                <Ionicons name="person" size={16} /> Gestionnaire
                            </Text>
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Prénom:</Text>
                                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{formData.managerFirstName}</Text>
                                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Nom:</Text>
                                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{formData.managerLastName}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Email:</Text>
                                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{formData.managerEmail}</Text>
                            </View>
                        </View>

                        <View style={[styles.infoBox, { backgroundColor: colors.infoBg, borderColor: colors.infoBorder }]}>
                            <Ionicons name="information-circle" size={20} color={colors.infoText} />
                            <Text style={[styles.infoText, { color: colors.infoText }]}>
                                En cliquant sur "Créer", vous allez créer simultanément la flotte et le compte du gestionnaire associé.
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

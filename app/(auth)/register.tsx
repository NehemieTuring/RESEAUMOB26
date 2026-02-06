/**
 * FleetMan Mobile - Register Screen
 * Multi-step registration form matching the web application
 * 4 Steps: Personal Info -> Account -> Organization -> Validation
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StatusBar,
    Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../src/constants/Colors';
import { Button, Input, Logo, PageHeader } from '../../src/components';
import {
    RegistrationFormData,
    Gender,
    OrganizationType,
    SubscriptionPlan,
    AdminRole,
    Language,
    GenderLabels,
    OrganizationTypeLabels,
    SubscriptionPlanLabels,
    AdminCreate,
    OrganizationCreate,
} from '../../src/types';
import { authApi, adminApi, organizationApi } from '../../src/services';

// Step configuration
const STEPS = [
    { id: 1, title: 'Vos Informations', description: 'Informations personnelles' },
    { id: 2, title: 'Compte', description: 'Mot de passe' },
    { id: 3, title: 'Organisation', description: 'Informations entreprise' },
    { id: 4, title: 'Validation', description: 'Récapitulatif' },
];

export default function RegisterScreen() {
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const { t, i18n } = useTranslation();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [acceptTerms, setAcceptTerms] = useState(false);

    // Form data state - matching web application
    const [formData, setFormData] = useState<RegistrationFormData>({
        // Step 1 - Personal Info
        adminFirstName: '',
        adminLastName: '',
        adminEmail: '',
        adminPhoneNumber: '',
        adminIdCardNumber: '',
        gender: Gender.MALE,
        personalAddress: '',
        personalCity: '',
        personalPostalCode: '',
        personalCountry: '',
        niu: '',
        taxNumber: '',

        // Step 2 - Account
        adminPassword: '',
        confirmPassword: '',

        // Step 3 - Organization
        organizationName: '',
        organizationDomainName: '',
        organizationPhone: '',
        registrationNumber: '',
        organizationAddress: '',
        organizationCity: '',
        organizationCountry: '',
        organizationUIN: '',
        organizationType: OrganizationType.LLC,
        subscriptionPlan: SubscriptionPlan.BASIC,
        organizationLogo: '',
    });

    // Update form field
    const updateField = (field: keyof RegistrationFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Validation for each step
    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.adminFirstName.trim()) newErrors.adminFirstName = 'Prénom requis';
            if (!formData.adminLastName.trim()) newErrors.adminLastName = 'Nom requis';
            if (!formData.adminEmail || !/\S+@\S+\.\S+/.test(formData.adminEmail)) {
                newErrors.adminEmail = 'Email invalide';
            }
            if (!formData.adminPhoneNumber || formData.adminPhoneNumber.length < 8) {
                newErrors.adminPhoneNumber = 'Téléphone requis (min 8 chiffres)';
            }
            if (!formData.adminIdCardNumber || formData.adminIdCardNumber.length < 5) {
                newErrors.adminIdCardNumber = 'Numéro CNI requis';
            }
            if (!formData.personalAddress || formData.personalAddress.length < 5) {
                newErrors.personalAddress = 'Adresse requise';
            }
            if (!formData.personalCity.trim()) newErrors.personalCity = 'Ville requise';
            if (!formData.personalPostalCode.trim()) newErrors.personalPostalCode = 'Code postal requis';
            if (!formData.personalCountry.trim()) newErrors.personalCountry = 'Pays requis';
            if (!formData.niu || formData.niu.length < 5) newErrors.niu = 'NIU requis';
        }

        if (step === 2) {
            if (!formData.adminPassword || formData.adminPassword.length < 8) {
                newErrors.adminPassword = 'Mot de passe de 8 caractères minimum';
            }
            if (formData.adminPassword !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
            }
        }

        if (step === 3) {
            if (!formData.organizationName || formData.organizationName.length < 2) {
                newErrors.organizationName = 'Nom de l\'organisation requis';
            }
            if (!formData.organizationPhone || formData.organizationPhone.length < 8) {
                newErrors.organizationPhone = 'Téléphone requis';
            }
            if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'RCCM requis';
            if (!formData.organizationAddress || formData.organizationAddress.length < 5) {
                newErrors.organizationAddress = 'Adresse requise';
            }
            if (!formData.organizationCity.trim()) newErrors.organizationCity = 'Ville requise';
            if (!formData.organizationCountry.trim()) newErrors.organizationCountry = 'Pays requis';
            if (!formData.organizationUIN.trim()) newErrors.organizationUIN = 'NIU Organisation requis';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Pick image
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            updateField('organizationLogo', result.assets[0].uri);
        }
    };

    // Navigation
    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    // Submit registration - Using transactional API (all or nothing)
    const handleSubmit = async () => {
        if (!acceptTerms) {
            Alert.alert('Attention', 'Veuillez cocher cette case si vous souhaitez continuer.');
            return;
        }

        setLoading(true);
        try {
            // Use the transactional registration endpoint
            // This creates Admin + Organization in a SINGLE atomic transaction
            // If ANY part fails, NOTHING is saved (automatic rollback)
            console.log('Starting transactional registration...');

            const registrationData = {
                // Admin data
                adminFirstName: formData.adminFirstName,
                adminLastName: formData.adminLastName,
                adminEmail: formData.adminEmail.trim().toLowerCase(),
                adminPassword: formData.adminPassword,
                adminPhoneNumber: formData.adminPhoneNumber,
                adminIdCardNumber: formData.adminIdCardNumber,
                personalAddress: formData.personalAddress,
                personalCity: formData.personalCity,
                personalPostalCode: formData.personalPostalCode,
                personalCountry: formData.personalCountry,
                taxNumber: formData.taxNumber || undefined,
                niu: formData.niu,
                gender: formData.gender,
                language: 'FR',
                // Organization data
                organizationName: formData.organizationName,
                organizationDomainName: formData.organizationDomainName || undefined,
                organizationPhone: formData.organizationPhone,
                registrationNumber: formData.registrationNumber,
                organizationAddress: formData.organizationAddress,
                organizationCity: formData.organizationCity,
                organizationCountry: formData.organizationCountry,
                organizationUIN: formData.organizationUIN,
                organizationTaxId: undefined, // Don't send empty taxId
                organizationType: formData.organizationType,
                subscriptionPlan: formData.subscriptionPlan,
            };

            console.log('Registration data:', registrationData);
            const result = await authApi.registerComplete(registrationData);

            if (!result.success) {
                throw new Error(result.message || "Erreur lors de l'inscription");
            }

            console.log('Registration successful!', result);

            // Upload Logo if exists (after successful registration)
            if (formData.organizationLogo && result.organization?.organizationId) {
                console.log('Uploading Logo...');
                try {
                    await organizationApi.uploadLogo(result.organization.organizationId, formData.organizationLogo);
                } catch (logoError) {
                    console.warn('Logo upload failed, but registration succeeded:', logoError);
                    // Don't fail registration if logo upload fails
                }
            }

            // Success - Navigate to login
            Alert.alert(
                'Inscription réussie! 🎉',
                'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
                [
                    {
                        text: 'Se connecter',
                        onPress: () => router.replace('/(auth)/login'),
                    },
                ]
            );

        } catch (error: any) {
            console.error('Registration error:', error);

            // Handle specific errors
            const errorMsg = error.message || 'Une erreur est survenue lors de l\'inscription.';

            if (errorMsg.toLowerCase().includes('email') && errorMsg.toLowerCase().includes('existe')) {
                setErrors(prev => ({ ...prev, adminEmail: errorMsg }));
                setCurrentStep(1); // Go back to step 1 where the email field is

                Alert.alert(
                    t('auth.register.emailConflictTitle'),
                    t('auth.register.emailConflictMessage'),
                    [
                        {
                            text: t('welcome.login'),
                            onPress: () => router.push('/(auth)/login')
                        },
                        {
                            text: t('common.cancel'),
                            style: 'cancel'
                        }
                    ]
                );
            } else if (errorMsg.toLowerCase().includes('organisation') || errorMsg.toLowerCase().includes('organization')) {
                // Organization-related error - go to step 3
                setCurrentStep(3);
                Alert.alert(t('common.error'), errorMsg);
            } else {
                Alert.alert(t('common.error'), errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };


    // Render progress bar
    const renderProgressBar = () => (
        <View style={styles.progressContainer}>
            <View style={[styles.progressLine, { backgroundColor: colors.borderGlass }]} />
            {STEPS.map((step, index) => (
                <View key={step.id} style={styles.progressStep}>
                    <View style={[
                        styles.progressCircle,
                        { borderColor: colors.borderGlass, backgroundColor: colors.surfaceCard },
                        currentStep >= step.id && { borderColor: colors.primaryBlue, backgroundColor: colors.primaryBlue },
                    ]}>
                        <Text style={[
                            styles.progressNumber,
                            { color: colors.textMuted },
                            currentStep >= step.id && { color: colors.white },
                        ]}>
                            {step.id}
                        </Text>
                    </View>
                    <Text style={[
                        styles.progressTitle,
                        { color: colors.textMuted },
                        currentStep >= step.id && { color: colors.primaryBlue, fontWeight: '600' },
                    ]}>
                        {t(`auth.register.step${step.id}`)}
                    </Text>
                </View>
            ))}
        </View>
    );

    // Render Step 1 - Personal Info
    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Vos Informations</Text>

            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <Input
                        label={t('form.firstName')}
                        placeholder={t('form.placeholder.firstName')}
                        value={formData.adminFirstName}
                        onChangeText={(v) => updateField('adminFirstName', v)}
                        error={errors.adminFirstName}
                        autoCapitalize="words"
                    />
                </View>
                <View style={styles.halfInput}>
                    <Input
                        label={t('form.lastName')}
                        placeholder={t('form.placeholder.lastName')}
                        value={formData.adminLastName}
                        onChangeText={(v) => updateField('adminLastName', v)}
                        error={errors.adminLastName}
                        autoCapitalize="words"
                    />
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <Input
                        label={t('form.email')}
                        placeholder={t('form.placeholder.email')}
                        value={formData.adminEmail}
                        onChangeText={(v) => updateField('adminEmail', v)}
                        error={errors.adminEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                <View style={styles.halfInput}>
                    <Input
                        label={t('form.phone')}
                        placeholder={t('form.placeholder.phone')}
                        value={formData.adminPhoneNumber}
                        onChangeText={(v) => updateField('adminPhoneNumber', v.replace(/[^0-9+]/g, ''))}
                        error={errors.adminPhoneNumber}
                        keyboardType="phone-pad"
                    />
                </View>
            </View>

            {/* Gender Selector */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('form.gender')}</Text>
            <View style={styles.pickerContainer}>
                {Object.values(Gender).map((g) => (
                    <TouchableOpacity
                        key={g}
                        style={[
                            styles.pickerOption,
                            { backgroundColor: colors.surfaceGlass, borderColor: colors.borderGlass },
                            formData.gender === g && { backgroundColor: colors.primaryBlue, borderColor: colors.primaryBlue },
                        ]}
                        onPress={() => updateField('gender', g)}
                    >
                        <Text style={[
                            styles.pickerOptionText,
                            { color: colors.textSecondary },
                            formData.gender === g && { color: colors.white, fontWeight: '600' },
                        ]}>
                            {GenderLabels[g][i18n.language.startsWith('fr') ? 'FR' : 'ENG']}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Input
                label={t('form.idCardNumber')}
                placeholder={t('form.placeholder.idCard')}
                value={formData.adminIdCardNumber}
                onChangeText={(v) => updateField('adminIdCardNumber', v)}
                error={errors.adminIdCardNumber}
            />

            <Input
                label={t('form.address')}
                placeholder={t('form.placeholder.address')}
                value={formData.personalAddress}
                onChangeText={(v) => updateField('personalAddress', v)}
                error={errors.personalAddress}
            />

            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <Input
                        label={t('form.city')}
                        placeholder={t('form.placeholder.city')}
                        value={formData.personalCity}
                        onChangeText={(v) => updateField('personalCity', v)}
                        error={errors.personalCity}
                    />
                </View>
                <View style={styles.halfInput}>
                    <Input
                        label={t('form.postalCode')}
                        placeholder={t('form.placeholder.postalCode')}
                        value={formData.personalPostalCode}
                        onChangeText={(v) => updateField('personalPostalCode', v)}
                        error={errors.personalPostalCode}
                    />
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <Input
                        label={t('form.country')}
                        placeholder={t('form.placeholder.country')}
                        value={formData.personalCountry}
                        onChangeText={(v) => updateField('personalCountry', v)}
                        error={errors.personalCountry}
                    />
                </View>
                <View style={styles.halfInput}>
                    <Input
                        label={t('form.niuAdmin')}
                        placeholder={t('form.placeholder.niu')}
                        value={formData.niu}
                        onChangeText={(v) => updateField('niu', v)}
                        error={errors.niu}
                    />
                </View>
            </View>
        </View>
    );

    // Render Step 2 - Account
    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Compte</Text>

            <Input
                label={t('form.password')}
                placeholder="••••••••"
                value={formData.adminPassword}
                onChangeText={(v) => updateField('adminPassword', v)}
                error={errors.adminPassword}
                isPassword
                autoCapitalize="none"
            />

            <Input
                label={t('form.confirmPassword')}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChangeText={(v) => updateField('confirmPassword', v)}
                error={errors.confirmPassword}
                isPassword
                autoCapitalize="none"
            />
        </View>
    );

    // Render Step 3 - Organization
    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Organisation</Text>

            <Input
                label={t('form.organizationName')}
                placeholder={t('form.placeholder.organizationName')}
                value={formData.organizationName}
                onChangeText={(v) => updateField('organizationName', v)}
                error={errors.organizationName}
            />

            {/* Organization Type Selector */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('form.activityType')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalPicker}>
                {Object.values(OrganizationType).map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[
                            styles.pickerOption,
                            { backgroundColor: colors.surfaceGlass, borderColor: colors.borderGlass },
                            formData.organizationType === type && { backgroundColor: colors.primaryBlue, borderColor: colors.primaryBlue },
                        ]}
                        onPress={() => updateField('organizationType', type)}
                    >
                        <Text style={[
                            styles.pickerOptionText,
                            { color: colors.textSecondary },
                            formData.organizationType === type && { color: colors.white, fontWeight: '600' },
                        ]}>
                            {OrganizationTypeLabels[type][i18n.language.startsWith('fr') ? 'FR' : 'ENG']}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Subscription Plan Selector */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('form.subscriptionPlan')}</Text>
            <View style={styles.pickerContainer}>
                {Object.values(SubscriptionPlan).filter(p => p !== SubscriptionPlan.FREE).map((plan) => (
                    <TouchableOpacity
                        key={plan}
                        style={[
                            styles.pickerOption,
                            { backgroundColor: colors.surfaceGlass, borderColor: colors.borderGlass },
                            formData.subscriptionPlan === plan && { backgroundColor: colors.primaryBlue, borderColor: colors.primaryBlue },
                        ]}
                        onPress={() => updateField('subscriptionPlan', plan)}
                    >
                        <Text style={[
                            styles.pickerOptionText,
                            { color: colors.textSecondary },
                            formData.subscriptionPlan === plan && { color: colors.white, fontWeight: '600' },
                        ]}>
                            {SubscriptionPlanLabels[plan][i18n.language.startsWith('fr') ? 'FR' : 'ENG']}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <Input
                        label={t('form.phone')}
                        placeholder={t('form.placeholder.phone')}
                        value={formData.organizationPhone}
                        onChangeText={(v) => updateField('organizationPhone', v.replace(/[^0-9+]/g, ''))}
                        error={errors.organizationPhone}
                        keyboardType="phone-pad"
                    />
                </View>
                <View style={styles.halfInput}>
                    <Input
                        label={t('form.rccm')}
                        placeholder={t('form.placeholder.rccm')}
                        value={formData.registrationNumber}
                        onChangeText={(v) => updateField('registrationNumber', v)}
                        error={errors.registrationNumber}
                    />
                </View>
            </View>

            <Input
                label={t('form.address')}
                placeholder={t('form.placeholder.address')}
                value={formData.organizationAddress}
                onChangeText={(v) => updateField('organizationAddress', v)}
                error={errors.organizationAddress}
            />

            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <Input
                        label={t('form.city')}
                        placeholder={t('form.placeholder.city')}
                        value={formData.organizationCity}
                        onChangeText={(v) => updateField('organizationCity', v)}
                        error={errors.organizationCity}
                    />
                </View>
                <View style={styles.halfInput}>
                    <Input
                        label={t('form.country')}
                        placeholder={t('form.placeholder.country')}
                        value={formData.organizationCountry}
                        onChangeText={(v) => updateField('organizationCountry', v)}
                        error={errors.organizationCountry}
                    />
                </View>
            </View>

            <Input
                label={t('form.niuOrg')}
                placeholder={t('form.placeholder.niu')}
                value={formData.organizationUIN}
                onChangeText={(v) => updateField('organizationUIN', v)}
                error={errors.organizationUIN}
            />

            {/* Logo Selection */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Logo de l'organisation</Text>
            <TouchableOpacity
                style={[styles.logoPicker, { borderColor: colors.borderGlass, backgroundColor: colors.surfaceGlass }]}
                onPress={pickImage}
            >
                {formData.organizationLogo ? (
                    <Image source={{ uri: formData.organizationLogo }} style={styles.pickedLogo} />
                ) : (
                    <View style={styles.logoPlaceholder}>
                        <Ionicons name="camera-outline" size={32} color={colors.textMuted} />
                        <Text style={[styles.logoPickerText, { color: colors.textMuted }]}>Choisir un logo</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    // Render Step 4 - Validation (Summary)
    const renderStep4 = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.textPrimary, borderBottomColor: colors.borderGlass }]}>{t('auth.register.step4')}</Text>

            {/* Admin Summary */}
            <View style={[styles.summaryCard, { backgroundColor: colors.surfaceGlass, borderColor: colors.borderGlass }]}>
                <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>Admin</Text>
                <Text style={[styles.summaryText, { color: colors.textSecondary }]}>{t('form.lastName')}: {formData.adminFirstName} {formData.adminLastName}</Text>
                <Text style={[styles.summaryText, { color: colors.textSecondary }]}>{t('form.email')}: {formData.adminEmail}</Text>
                <Text style={[styles.summaryText, { color: colors.textSecondary }]}>{t('form.phone')}: {formData.adminPhoneNumber}</Text>
            </View>

            {/* Organization Summary */}
            <View style={[styles.summaryCard, { backgroundColor: colors.surfaceGlass, borderColor: colors.borderGlass }]}>
                <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>{t('auth.register.step3')}</Text>
                <Text style={[styles.summaryText, { color: colors.textSecondary }]}>{t('form.lastName')}: {formData.organizationName}</Text>
                <Text style={[styles.summaryText, { color: colors.textSecondary }]}>Type: {OrganizationTypeLabels[formData.organizationType][i18n.language.startsWith('fr') ? 'FR' : 'ENG']}</Text>
                <Text style={[styles.summaryText, { color: colors.textSecondary }]}>Plan: {SubscriptionPlanLabels[formData.subscriptionPlan][i18n.language.startsWith('fr') ? 'FR' : 'ENG']}</Text>
                <Text style={[styles.summaryText, { color: colors.textSecondary }]}>{t('form.address')}: {formData.organizationAddress}, {formData.organizationCity}</Text>
                {formData.organizationLogo && (
                    <View style={styles.summaryLogoContainer}>
                        <Text style={[styles.summaryText, { color: colors.textSecondary, marginBottom: 8 }]}>Logo:</Text>
                        <Image source={{ uri: formData.organizationLogo }} style={styles.summaryLogo} />
                    </View>
                )}
            </View>

            {/* Terms Checkbox */}
            <View style={styles.termsContainer}>
                <TouchableOpacity
                    onPress={() => setAcceptTerms(!acceptTerms)}
                    activeOpacity={0.7}
                    style={styles.checkboxTouchable}
                >
                    <View style={[
                        styles.checkbox,
                        { borderColor: colors.borderGlass },
                        acceptTerms && { backgroundColor: colors.primaryBlue, borderColor: colors.primaryBlue }
                    ]}>
                        {acceptTerms && <Ionicons name="checkmark" size={14} color={colors.white} />}
                    </View>
                </TouchableOpacity>
                <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                    {t('auth.register.acceptTerms')}{' '}
                    <Text
                        style={[styles.termsLink, { color: colors.primaryBlue }]}
                        onPress={() => router.push('/(auth)/terms')}
                    >
                        {t('auth.register.termsLink')}
                    </Text>
                </Text>
            </View>

            {!acceptTerms && (
                <View style={[styles.termsWarning, { backgroundColor: colors.warningBg, borderColor: colors.warningBorder }]}>
                    <Ionicons name="warning" size={16} color={colors.warningText} />
                    <Text style={[styles.termsWarningText, { color: colors.warningText }]}>
                        {t('auth.register.termsWarning')}
                    </Text>
                </View>
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.primaryDark }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <LinearGradient
                colors={isDarkMode ? ['#09090b', '#0f172a', '#09090b'] : ['#f0f9ff', '#ffffff', '#f0f9ff']}
                style={StyleSheet.absoluteFillObject}
            />

            <PageHeader />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Logo size="small" />
                    <Text style={[styles.title, { color: colors.textPrimary }]}>{t('auth.register.title')}</Text>
                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity>
                            <Text style={[styles.loginLink, { color: colors.textSecondary }]}>
                                {t('auth.register.subtitle')}
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>

                {/* Progress Bar */}
                {renderProgressBar()}

                {/* Form Card */}
                <View style={[
                    styles.formCard,
                    {
                        backgroundColor: colors.surfaceCard,
                        borderColor: colors.borderGlass,
                        shadowColor: isDarkMode ? '#000' : colors.primaryBlue,
                        shadowOpacity: isDarkMode ? 0 : 0.05,
                        shadowRadius: 15,
                        elevation: isDarkMode ? 0 : 2
                    }
                ]}>
                    <Text style={[styles.stepTitle, { color: colors.textPrimary, borderBottomColor: colors.borderGlass }]}>
                        {t(`auth.register.step${currentStep}`)}
                    </Text>
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                    {currentStep === 4 && renderStep4()}

                    {/* Navigation Buttons */}
                    <View style={styles.buttonContainer}>
                        {currentStep > 1 && (
                            <Button
                                title={t('form.back')}
                                onPress={prevStep}
                                variant="outline"
                                icon={<Ionicons name="arrow-back" size={18} color={colors.primaryBlue} />}
                            />
                        )}

                        <View style={styles.spacer} />

                        {currentStep < 4 ? (
                            <Button
                                title={t('form.next')}
                                onPress={nextStep}
                                variant="primary"
                                icon={<Ionicons name="arrow-forward" size={18} color={colors.white} />}
                            />
                        ) : (
                            <Button
                                title={loading ? t('form.loading') : t('common.confirm')}
                                onPress={handleSubmit}
                                variant="primary"
                                disabled={loading}
                                loading={loading}
                            />
                        )}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primaryDark,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginTop: 16,
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    loginLink: {
        color: Colors.textSecondary,
        fontSize: 14,
        marginTop: 8,
    },
    loginLinkBold: {
        color: Colors.primaryBlue,
        fontWeight: '600',
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        position: 'relative',
        paddingHorizontal: 8,
    },
    progressLine: {
        position: 'absolute',
        top: 16,
        left: 40,
        right: 40,
        height: 2,
        backgroundColor: Colors.borderGlass,
    },
    progressStep: {
        alignItems: 'center',
        flex: 1,
    },
    progressCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: Colors.borderGlass,
        backgroundColor: Colors.surfaceCard,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    progressCircleActive: {
        borderColor: Colors.primaryBlue,
        backgroundColor: Colors.primaryBlue,
    },
    progressNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textMuted,
    },
    progressNumberActive: {
        color: Colors.white,
    },
    progressTitle: {
        fontSize: 11,
        color: Colors.textMuted,
        textAlign: 'center',
    },
    progressTitleActive: {
        color: Colors.primaryBlue,
        fontWeight: '500',
    },
    formCard: {
        backgroundColor: Colors.surfaceCard,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.borderGlass,
    },
    stepContainer: {
        marginBottom: 16,
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderGlass,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textSecondary,
        marginBottom: 8,
        marginTop: 8,
    },
    pickerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    horizontalPicker: {
        marginBottom: 12,
    },
    pickerOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: Colors.surfaceGlass,
        borderWidth: 1,
        borderColor: Colors.borderGlass,
        marginRight: 8,
    },
    pickerOptionActive: {
        backgroundColor: Colors.primaryBlue,
        borderColor: Colors.primaryBlue,
    },
    pickerOptionText: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    pickerOptionTextActive: {
        color: Colors.white,
        fontWeight: '500',
    },
    summaryCard: {
        backgroundColor: Colors.surfaceGlass,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.borderGlass,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 12,
    },
    summaryText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    checkboxTouchable: {
        marginRight: 12,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: Colors.borderGlass,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: Colors.primaryBlue,
        borderColor: Colors.primaryBlue,
    },
    termsText: {
        flex: 1,
        color: Colors.textSecondary,
        fontSize: 14,
        lineHeight: 22,
    },
    termsLink: {
        color: Colors.primaryBlue,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    termsWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.warningBg,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.warningBorder,
        marginBottom: 16,
    },
    termsWarningText: {
        color: Colors.warningText,
        fontSize: 13,
        marginLeft: 8,
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    spacer: {
        flex: 1,
    },
    logoPicker: {
        width: '100%',
        height: 120,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        overflow: 'hidden',
    },
    logoPlaceholder: {
        alignItems: 'center',
    },
    logoPickerText: {
        fontSize: 14,
        marginTop: 8,
    },
    pickedLogo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    summaryLogoContainer: {
        marginTop: 12,
    },
    summaryLogo: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
});

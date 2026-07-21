const fs = require('fs');
const path = require('path');

const authDir = path.join(__dirname, 'app', '(auth)');

// 1. login.tsx
const loginContent = `/**
 * FleetMan Mobile - Login Screen
 * Identical to Web UI
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
    TextInput,
    StatusBar,
    ImageBackground,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../src/services';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simulated Google Icon
const GoogleIcon = () => (
    <Ionicons name="logo-google" size={20} color="#EA4335" style={{ marginRight: 10 }} />
);

export default function LoginScreen() {
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            setError("Identifiants incorrects. Vérifiez votre email et mot de passe.");
            return;
        }

        setError('');
        setLoading(true);
        try {
            const response = await authApi.login({
                email: email.trim().toLowerCase(),
                password
            });

            if (response.success) {
                await AsyncStorage.setItem('user', JSON.stringify({
                    userId: response.userId,
                    email: response.email,
                    fullName: response.fullName,
                    role: response.role,
                    userType: response.userType,
                    adminId: response.adminId,
                    organizationId: response.organizationId,
                }));
                await AsyncStorage.setItem('isLoggedIn', 'true');
                router.replace('/(tabs)/home');
            } else {
                setError(response.message || "Identifiants incorrects.");
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError("Impossible de se connecter au serveur.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground 
            source={require('../../assets/login-truck-highway.jpg')} 
            style={[styles.container, { backgroundColor: colors.primaryDark }]}
            imageStyle={{ opacity: isDarkMode ? 0.8 : 0.7 }}
        >
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <LinearGradient
                colors={isDarkMode ? ['rgba(15, 23, 42, 0.7)', 'rgba(15, 23, 42, 0.55)', 'rgba(14, 165, 233, 0.4)'] : ['rgba(15, 23, 42, 0.7)', 'rgba(15, 23, 42, 0.55)', 'rgba(14, 165, 233, 0.4)']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo (Top of card like Web) */}
                    <View style={styles.logoContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="car-sport" size={32} color="#ffffff" />
                            <Text style={{ fontSize: 28, fontWeight: '800', color: '#ffffff', marginLeft: 8 }}>
                                FleetMan
                            </Text>
                        </View>
                    </View>

                    {/* Glassmorphic Form Card */}
                    <View style={[
                        styles.formCard,
                        {
                            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                            borderColor: 'rgba(255, 255, 255, 0.4)',
                        }
                    ]}>
                        <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
                            Bon retour parmi nous
                        </Text>
                        <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
                            Connectez-vous à votre compte FleetMan
                        </Text>

                        {error ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Email</Text>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: isDarkMode ? 'transparent' : 'transparent',
                                    borderColor: colors.borderGlass
                                }
                            ]}>
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary }]}
                                    placeholder="superadmin@fleetman.cm"
                                    placeholderTextColor={colors.textMuted}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <View style={styles.passwordHeader}>
                                <Text style={[styles.label, { color: colors.textPrimary }]}>Mot de passe</Text>
                                <Link href="/(auth)/forgot-password" asChild>
                                    <TouchableOpacity>
                                        <Text style={[styles.forgotPasswordText, { color: colors.primaryBlue }]}>
                                            Mot de passe oublié ?
                                        </Text>
                                    </TouchableOpacity>
                                </Link>
                            </View>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: 'transparent',
                                    borderColor: colors.borderGlass
                                }
                            ]}>
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary }]}
                                    placeholder="••••••••"
                                    placeholderTextColor={colors.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.loginButton, { backgroundColor: isDarkMode ? colors.white : '#0f172a' }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={isDarkMode ? '#0f172a' : colors.white} />
                            ) : (
                                <Text style={[styles.loginButtonText, { color: isDarkMode ? '#0f172a' : colors.white }]}>Se connecter</Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={[styles.dividerLine, { backgroundColor: colors.borderGlass }]} />
                            <Text style={[styles.dividerText, { color: colors.textMuted, backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)' }]}>ou</Text>
                            <View style={[styles.dividerLine, { backgroundColor: colors.borderGlass }]} />
                        </View>

                        {/* Google Button */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.googleButton, { borderColor: colors.borderGlass }]}
                            disabled
                        >
                            <GoogleIcon />
                            <Text style={[styles.googleButtonText, { color: colors.textPrimary }]}>Continuer avec Google</Text>
                        </TouchableOpacity>

                        {/* Register Link */}
                        <View style={styles.registerContainer}>
                            <Text style={[styles.registerText, { color: colors.textSecondary }]}>Pas encore de compte ? </Text>
                            <Link href="/(auth)/register" asChild>
                                <TouchableOpacity>
                                    <Text style={[styles.registerLink, { color: colors.primaryBlue }]}>Créer un compte</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 16, paddingTop: 40 },
    logoContainer: { alignItems: 'center', marginBottom: 24 },
    formCard: { 
        borderRadius: 24, 
        padding: 24, 
        borderWidth: 1,
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
    },
    formTitle: { fontSize: 26, fontWeight: '800', marginBottom: 8, letterSpacing: -0.5 },
    formSubtitle: { fontSize: 14, marginBottom: 24 },
    errorContainer: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 20 },
    errorText: { color: '#ef4444', fontSize: 13 },
    inputGroup: { marginBottom: 20 },
    passwordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 16, borderWidth: 1, height: 48 },
    input: { flex: 1, fontSize: 15, height: '100%' },
    forgotPasswordText: { fontSize: 13, fontWeight: '500' },
    loginButton: { height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    loginButtonText: { fontSize: 15, fontWeight: '600' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { marginHorizontal: 10, fontSize: 12, textTransform: 'uppercase', paddingHorizontal: 4, overflow: 'hidden' },
    googleButton: { flexDirection: 'row', height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 24 },
    googleButtonText: { fontSize: 14, fontWeight: '500' },
    registerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
    registerText: { fontSize: 14 },
    registerLink: { fontSize: 14, fontWeight: '600' },
});
`;

fs.writeFileSync(path.join(authDir, 'login.tsx'), loginContent);

// 2. forgot-password.tsx
const forgotPasswordContent = `/**
 * FleetMan Mobile - Forgot Password Screen
 * Identical to Web UI
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ImageBackground,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(t);
    }, [cooldown]);

    const handleSubmit = () => {
        setError('');
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            if (!email.includes('@')) {
                setError('Veuillez entrer une adresse email valide.');
                return;
            }
            setSent(true);
            setCooldown(60);
        }, 600);
    };

    return (
        <ImageBackground 
            source={require('../../assets/login-truck-highway.jpg')} 
            style={[styles.container, { backgroundColor: colors.primaryDark }]}
            imageStyle={{ opacity: isDarkMode ? 0.8 : 0.7 }}
        >
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <LinearGradient
                colors={isDarkMode ? ['rgba(15, 23, 42, 0.7)', 'rgba(15, 23, 42, 0.55)', 'rgba(14, 165, 233, 0.4)'] : ['rgba(15, 23, 42, 0.7)', 'rgba(15, 23, 42, 0.55)', 'rgba(14, 165, 233, 0.4)']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="car-sport" size={32} color="#ffffff" />
                            <Text style={{ fontSize: 28, fontWeight: '800', color: '#ffffff', marginLeft: 8 }}>
                                FleetMan
                            </Text>
                        </View>
                    </View>

                    {/* Glassmorphic Form Card */}
                    <View style={[
                        styles.formCard,
                        {
                            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                            borderColor: 'rgba(255, 255, 255, 0.4)',
                        }
                    ]}>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity style={styles.backLink}>
                                <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
                                <Text style={[styles.backText, { color: colors.textSecondary }]}>Retour à la connexion</Text>
                            </TouchableOpacity>
                        </Link>

                        <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
                            Réinitialiser votre mot de passe
                        </Text>
                        <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
                            Entrez votre email pour recevoir un lien de réinitialisation
                        </Text>

                        {sent ? (
                            <View style={[styles.successContainer, { backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)' }]}>
                                <Ionicons name="checkmark-circle" size={40} color="#22c55e" style={{ marginBottom: 12 }} />
                                <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Email envoyé !</Text>
                                <Text style={[styles.successText, { color: colors.textSecondary }]}>
                                    Vérifiez votre boîte de réception à <Text style={{ fontWeight: '600' }}>{email}</Text>.
                                </Text>
                                {cooldown > 0 && (
                                    <Text style={[styles.cooldownText, { color: colors.textSecondary }]}>
                                        Nouvelle tentative dans {cooldown}s
                                    </Text>
                                )}
                                <TouchableOpacity
                                    style={[styles.resendButton, { backgroundColor: 'transparent', borderColor: colors.borderGlass }]}
                                    disabled={cooldown > 0}
                                    onPress={() => { setSent(false); setCooldown(0); }}
                                >
                                    <Text style={[styles.resendButtonText, { color: colors.textPrimary, opacity: cooldown > 0 ? 0.5 : 1 }]}>
                                        Renvoyer le lien
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View>
                                {/* Email Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textPrimary }]}>Email</Text>
                                    <View style={[
                                        styles.inputContainer,
                                        { backgroundColor: 'transparent', borderColor: colors.borderGlass }
                                    ]}>
                                        <TextInput
                                            style={[styles.input, { color: colors.textPrimary }]}
                                            placeholder="vous@entreprise.cm"
                                            placeholderTextColor={colors.textMuted}
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                {error ? (
                                    <Text style={styles.errorText}>{error}</Text>
                                ) : null}

                                {/* Submit Button */}
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={[styles.submitButton, { backgroundColor: isDarkMode ? colors.white : '#0f172a' }]}
                                    onPress={handleSubmit}
                                    disabled={loading}
                                >
                                    <Text style={[styles.submitButtonText, { color: isDarkMode ? '#0f172a' : colors.white }]}>
                                        {loading ? "Envoi..." : "Envoyer le lien"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 16, paddingTop: 40 },
    logoContainer: { alignItems: 'center', marginBottom: 24 },
    formCard: { 
        borderRadius: 24, 
        padding: 24, 
        borderWidth: 1,
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
    },
    backLink: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    backText: { fontSize: 14, marginLeft: 8 },
    formTitle: { fontSize: 26, fontWeight: '800', marginBottom: 8, letterSpacing: -0.5 },
    formSubtitle: { fontSize: 14, marginBottom: 24 },
    errorText: { color: '#ef4444', fontSize: 13, marginBottom: 16 },
    inputGroup: { marginBottom: 24 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 16, borderWidth: 1, height: 48 },
    input: { flex: 1, fontSize: 15, height: '100%' },
    submitButton: { height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    submitButtonText: { fontSize: 15, fontWeight: '600' },
    successContainer: { padding: 24, borderRadius: 12, borderWidth: 1, marginTop: 8 },
    successTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    successText: { fontSize: 14, marginBottom: 16, lineHeight: 20 },
    cooldownText: { fontSize: 13, marginBottom: 16 },
    resendButton: { height: 40, borderRadius: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginTop: 8 },
    resendButtonText: { fontSize: 14, fontWeight: '500' },
});
`;

fs.writeFileSync(path.join(authDir, 'forgot-password.tsx'), forgotPasswordContent);

// 3. register.tsx
const registerContent = `/**
 * FleetMan Mobile - Register Screen
 * Single form identical to Web UI
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
    TextInput,
    StatusBar,
    ImageBackground,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { authApi } from '../../src/services';
import { OrganizationType, SubscriptionPlan } from '../../src/types';

export default function RegisterScreen() {
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [accepted, setAccepted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        companyName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isStrong = formData.password.length >= 8 && /[A-Z]/.test(formData.password) && /\\d/.test(formData.password);

    const handleSubmit = async () => {
        if (!accepted || !isStrong || formData.password !== formData.confirmPassword) return;

        setLoading(true);
        setError('');

        try {
            // Re-using the transactional api with defaults for the extra fields it requires
            // since the web uses a different backend endpoint that we might not have in the mobile sdk yet
            const registrationData = {
                adminFirstName: formData.firstName,
                adminLastName: formData.lastName,
                adminEmail: formData.email.trim().toLowerCase(),
                adminPassword: formData.password,
                adminPhoneNumber: formData.phone,
                adminIdCardNumber: "PENDING", // Web does document upload separately
                personalAddress: "PENDING",
                personalCity: "PENDING",
                personalPostalCode: "0000",
                personalCountry: "CMR",
                niu: "PENDING",
                gender: "MALE" as any,
                language: 'FR',
                organizationName: formData.companyName,
                organizationPhone: formData.phone,
                registrationNumber: "PENDING",
                organizationAddress: "PENDING",
                organizationCity: "PENDING",
                organizationCountry: "CMR",
                organizationUIN: "PENDING",
                organizationType: OrganizationType.LLC,
                subscriptionPlan: SubscriptionPlan.BASIC,
            };

            const result = await authApi.registerComplete(registrationData);

            if (!result.success) {
                throw new Error(result.message || "Erreur lors de l'inscription");
            }

            Alert.alert(
                'Inscription réussie! 🎉',
                'Votre demande de souscription a été enregistrée. Vous pouvez maintenant vous connecter.',
                [{ text: 'Se connecter', onPress: () => router.replace('/(auth)/login') }]
            );

        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || "Erreur lors de l'inscription.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground 
            source={require('../../assets/login-truck-highway.jpg')} 
            style={[styles.container, { backgroundColor: colors.primaryDark }]}
            imageStyle={{ opacity: isDarkMode ? 0.8 : 0.7 }}
        >
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <LinearGradient
                colors={isDarkMode ? ['rgba(15, 23, 42, 0.7)', 'rgba(15, 23, 42, 0.55)', 'rgba(14, 165, 233, 0.4)'] : ['rgba(15, 23, 42, 0.7)', 'rgba(15, 23, 42, 0.55)', 'rgba(14, 165, 233, 0.4)']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="car-sport" size={32} color="#ffffff" />
                            <Text style={{ fontSize: 28, fontWeight: '800', color: '#ffffff', marginLeft: 8 }}>
                                FleetMan
                            </Text>
                        </View>
                    </View>

                    {/* Glassmorphic Form Card */}
                    <View style={[
                        styles.formCard,
                        {
                            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                            borderColor: 'rgba(255, 255, 255, 0.4)',
                        }
                    ]}>
                        <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Rejoignez FleetMan</Text>
                        <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>Créez votre compte gestionnaire de flotte</Text>

                        {/* First & Last Name */}
                        <View style={styles.row}>
                            <View style={styles.halfInputGroup}>
                                <Text style={[styles.label, { color: colors.textPrimary }]}>Prénom *</Text>
                                <View style={[styles.inputContainer, { borderColor: colors.borderGlass }]}>
                                    <TextInput style={[styles.input, { color: colors.textPrimary }]} value={formData.firstName} onChangeText={(v) => updateField('firstName', v)} />
                                </View>
                            </View>
                            <View style={styles.halfInputGroup}>
                                <Text style={[styles.label, { color: colors.textPrimary }]}>Nom *</Text>
                                <View style={[styles.inputContainer, { borderColor: colors.borderGlass }]}>
                                    <TextInput style={[styles.input, { color: colors.textPrimary }]} value={formData.lastName} onChangeText={(v) => updateField('lastName', v)} />
                                </View>
                            </View>
                        </View>

                        {/* Company */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Nom entreprise *</Text>
                            <View style={[styles.inputContainer, { borderColor: colors.borderGlass }]}>
                                <TextInput style={[styles.input, { color: colors.textPrimary }]} placeholder="Transport Express CM" placeholderTextColor={colors.textMuted} value={formData.companyName} onChangeText={(v) => updateField('companyName', v)} />
                            </View>
                        </View>

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Email *</Text>
                            <View style={[styles.inputContainer, { borderColor: colors.borderGlass }]}>
                                <TextInput style={[styles.input, { color: colors.textPrimary }]} placeholder="vous@entreprise.cm" placeholderTextColor={colors.textMuted} value={formData.email} onChangeText={(v) => updateField('email', v)} keyboardType="email-address" autoCapitalize="none" />
                            </View>
                        </View>

                        {/* Phone */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Téléphone *</Text>
                            <View style={[styles.inputContainer, { borderColor: colors.borderGlass }]}>
                                <TextInput style={[styles.input, { color: colors.textPrimary }]} placeholder="+237 6XX XX XX XX" placeholderTextColor={colors.textMuted} value={formData.phone} onChangeText={(v) => updateField('phone', v)} keyboardType="phone-pad" />
                            </View>
                        </View>

                        {/* Password */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Mot de passe *</Text>
                            <View style={[styles.inputContainer, { borderColor: colors.borderGlass }]}>
                                <TextInput style={[styles.input, { color: colors.textPrimary }]} secureTextEntry={!showPassword} value={formData.password} onChangeText={(v) => updateField('password', v)} />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>
                            {formData.password.length > 0 && (
                                <View style={{ marginTop: 8 }}>
                                    <Text style={{ fontSize: 12, color: formData.password.length >= 8 ? '#22c55e' : colors.textSecondary }}><Ionicons name={formData.password.length >= 8 ? "checkmark" : "close"} size={12}/> 8 caractères minimum</Text>
                                    <Text style={{ fontSize: 12, color: /[A-Z]/.test(formData.password) ? '#22c55e' : colors.textSecondary }}><Ionicons name={/[A-Z]/.test(formData.password) ? "checkmark" : "close"} size={12}/> Une majuscule</Text>
                                    <Text style={{ fontSize: 12, color: /\\d/.test(formData.password) ? '#22c55e' : colors.textSecondary }}><Ionicons name={/\\d/.test(formData.password) ? "checkmark" : "close"} size={12}/> Un chiffre</Text>
                                </View>
                            )}
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Confirmer le mot de passe *</Text>
                            <View style={[styles.inputContainer, { borderColor: colors.borderGlass }]}>
                                <TextInput style={[styles.input, { color: colors.textPrimary }]} secureTextEntry={true} value={formData.confirmPassword} onChangeText={(v) => updateField('confirmPassword', v)} />
                            </View>
                        </View>

                        {/* Checkbox */}
                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAccepted(!accepted)} activeOpacity={0.8}>
                            <View style={[styles.checkbox, { borderColor: colors.borderGlass, backgroundColor: accepted ? isDarkMode ? colors.white : '#0f172a' : 'transparent' }]}>
                                {accepted && <Ionicons name="checkmark" size={14} color={isDarkMode ? '#0f172a' : colors.white} />}
                            </View>
                            <Text style={[styles.checkboxText, { color: colors.textSecondary }]}>J'accepte les CGU et la politique de confidentialité</Text>
                        </TouchableOpacity>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        {/* Submit Button */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.submitButton, { backgroundColor: isDarkMode ? colors.white : '#0f172a', opacity: (accepted && isStrong && formData.password === formData.confirmPassword) ? 1 : 0.5 }]}
                            onPress={handleSubmit}
                            disabled={loading || !accepted || !isStrong || formData.password !== formData.confirmPassword}
                        >
                            <Text style={[styles.submitButtonText, { color: isDarkMode ? '#0f172a' : colors.white }]}>
                                {loading ? "Envoi en cours..." : "Soumettre ma demande"}
                            </Text>
                        </TouchableOpacity>

                        {/* Login Link */}
                        <View style={styles.loginContainer}>
                            <Text style={[styles.loginText, { color: colors.textSecondary }]}>Déjà inscrit ? </Text>
                            <Link href="/(auth)/login" asChild>
                                <TouchableOpacity>
                                    <Text style={[styles.loginLink, { color: colors.primaryBlue }]}>Se connecter</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 16, paddingTop: 40, paddingBottom: 40 },
    logoContainer: { alignItems: 'center', marginBottom: 24 },
    formCard: { 
        borderRadius: 24, 
        padding: 24, 
        borderWidth: 1,
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
    },
    formTitle: { fontSize: 26, fontWeight: '800', marginBottom: 8, letterSpacing: -0.5 },
    formSubtitle: { fontSize: 14, marginBottom: 24 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    halfInputGroup: { width: '48%', marginBottom: 16 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, height: 44 },
    input: { flex: 1, fontSize: 15, height: '100%' },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingRight: 20 },
    checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
    checkboxText: { fontSize: 13, lineHeight: 18, flex: 1 },
    errorText: { color: '#ef4444', fontSize: 13, marginBottom: 16 },
    submitButton: { height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    submitButtonText: { fontSize: 15, fontWeight: '600' },
    loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    loginText: { fontSize: 14 },
    loginLink: { fontSize: 14, fontWeight: '600' },
});
`;

fs.writeFileSync(path.join(authDir, 'register.tsx'), registerContent);

console.log("Updated auth screens successfully.");

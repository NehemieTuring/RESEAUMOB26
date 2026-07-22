/**
 * FleetMan Mobile - Login Screen
 * Premium login form with theme and i18n support
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    ImageBackground,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput,
    StatusBar,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../src/services';
import { PageHeader } from '../../src/components';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};
        if (!email.trim()) {
            newErrors.email = t('validation.emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = t('validation.emailInvalid');
        }
        if (!password) {
            newErrors.password = t('validation.passwordMin');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) {
            const firstError = errors.email || errors.password;
            if (firstError) {
                Alert.alert(t('auth.login.error'), firstError);
            }
            return;
        }

        setLoading(true);
        try {
            // Call real API endpoint
            const response = await authApi.login({
                email: email.trim().toLowerCase(),
                password
            });

            if (response.success) {
                // Store user data
                await AsyncStorage.setItem('user', JSON.stringify({
                    userId: response.userId,
                    userUuid: response.userUuid,
                    email: response.email,
                    fullName: response.fullName,
                    role: response.role,
                    roles: response.roles,
                    userType: response.userType,
                    adminId: response.adminId,
                    organizationId: response.organizationId,
                    profilePhotoUrl: response.profilePhotoUrl,
                }));
                await AsyncStorage.setItem('isLoggedIn', 'true');

                // Redirection selon le role renvoye par le backend.
                if (response.role === 'FLEET_DRIVER') {
                    router.replace('/(driver)/home');
                } else {
                    router.replace('/(tabs)/home');
                }
            } else {
                Alert.alert(
                    t('auth.login.error'),
                    t('auth.login.invalidCredentials') || response.message
                );
            }
        } catch (error: any) {
            console.error('Login error:', error);
            Alert.alert(
                t('auth.login.error'),
                t('auth.login.serverError') || error.message
            );
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
                colors={isDarkMode ? ['rgba(9, 9, 11, 0.6)', 'rgba(15, 23, 42, 0.7)', 'rgba(9, 9, 11, 0.8)'] : ['rgba(248, 250, 252, 0.5)', 'rgba(255, 255, 255, 0.4)', 'rgba(241, 245, 249, 0.6)']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <PageHeader />

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
                    {/* Header Logo equivalent */}
                    <View style={styles.headerLogoContainer}>
                        <Image 
                            source={require('../../assets/images/logo-fleetman.png')} 
                            style={{ width: 160, height: 45, resizeMode: 'contain', tintColor: '#ffffff' }}
                        />
                        <Text style={[styles.headerSubtitle, { color: '#ffffff' }]}>
                            Votre flotte sous contrôle
                        </Text>
                    </View>

                    <View style={[
                        styles.formCard,
                        {
                            backgroundColor: isDarkMode ? colors.surfaceCard : 'rgba(225, 228, 232, 0.95)',
                            borderColor: colors.borderGlass,
                        }
                    ]}>
                        <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Bon retour parmi nous</Text>
                        <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>Connectez-vous à votre compte FleetMan</Text>

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Email</Text>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: isDarkMode ? colors.surfaceGlass : '#f0f3f5',
                                    borderColor: errors.email ? colors.errorBorder : colors.borderGlass
                                }
                            ]}>
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary }]}
                                    placeholder="root"
                                    placeholderTextColor={colors.textMuted}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            {errors.email && <Text style={[styles.errorText, { color: colors.errorText }]}>{errors.email}</Text>}
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={[styles.label, { color: colors.textPrimary }]}>Mot de passe</Text>
                                <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                                    <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: isDarkMode ? colors.surfaceGlass : '#f0f3f5',
                                    borderColor: errors.password ? colors.errorBorder : colors.borderGlass
                                }
                            ]}>
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary }]}
                                    placeholder="••••"
                                    placeholderTextColor={colors.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>
                            {errors.password && <Text style={[styles.errorText, { color: colors.errorText }]}>{errors.password}</Text>}
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.loginButton, { backgroundColor: '#3b82f6' }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={[styles.loginButtonText, { color: colors.white }]}>Se connecter</Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={[styles.dividerLine, { backgroundColor: colors.borderGlass }]} />
                            <Text style={[styles.dividerText, { color: colors.textMuted, backgroundColor: isDarkMode ? colors.surfaceCard : '#e1e4e8' }]}>OU</Text>
                            <View style={[styles.dividerLine, { backgroundColor: colors.borderGlass }]} />
                        </View>

                        {/* Google Button */}
                        <TouchableOpacity style={[styles.googleButton, { backgroundColor: isDarkMode ? colors.surfaceGlass : '#f0f3f5' }]}>
                            <Ionicons name="logo-google" size={18} color={colors.textPrimary} />
                            <Text style={[styles.googleButtonText, { color: colors.textPrimary }]}>Continuer avec Google</Text>
                        </TouchableOpacity>

                        {/* Register Link */}
                        <View style={styles.registerContainer}>
                            <Text style={[styles.registerText, { color: colors.textSecondary }]}>Pas encore de compte ? </Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                                <Text style={[styles.registerLink, { color: '#3b82f6' }]}>Créer un compte</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Footer */}
                    <Text style={styles.footerText}>
                        © 2026 FleetMan. Tous droits réservés.
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, width: '100%', minHeight: '100%' },
    keyboardView: { flex: 1, width: '100%' },
    scrollView: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24, paddingTop: 60 },
    headerLogoContainer: { alignItems: 'center', marginBottom: 40 },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerLogoText: { fontSize: 24, fontWeight: '800' },
    headerSubtitle: { fontSize: 13, marginTop: 4, opacity: 0.9 },
    formCard: { 
        width: '100%',
        maxWidth: 450,
        borderRadius: 20, 
        padding: 32, 
        borderWidth: 1,
        marginBottom: 40
    },
    formTitle: { fontSize: 28, fontWeight: '700', marginBottom: 6, letterSpacing: -0.5 },
    formSubtitle: { fontSize: 15, marginBottom: 28 },
    inputGroup: { marginBottom: 20 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    label: { fontSize: 13, fontWeight: '700', marginLeft: 2, marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, borderWidth: 1 },
    input: { flex: 1, paddingVertical: 14, fontSize: 15 },
    errorText: { fontSize: 12, marginTop: 6, marginLeft: 4 },
    forgotPasswordText: { fontSize: 13, fontWeight: '500', color: '#3b82f6' },
    loginButton: { paddingVertical: 16, borderRadius: 24, alignItems: 'center', marginBottom: 20 },
    loginButtonText: { fontSize: 16, fontWeight: '600' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { marginHorizontal: 12, fontSize: 12, fontWeight: '600', paddingHorizontal: 4 },
    googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 24, marginBottom: 24, gap: 10 },
    googleButtonText: { fontSize: 14, fontWeight: '600' },
    registerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    registerText: { fontSize: 14 },
    registerLink: { fontSize: 14, fontWeight: '600' },
    footerText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 'auto' },
});

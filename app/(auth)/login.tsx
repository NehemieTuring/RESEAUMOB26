/**
 * FleetMan Mobile - Login Screen
 * Premium login form with theme and i18n support
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
        <View style={[styles.container, { backgroundColor: colors.primaryDark }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <LinearGradient
                colors={isDarkMode ? ['#09090b', '#0f172a', '#09090b'] : ['#f0f9ff', '#ffffff', '#f0f9ff']}
                style={StyleSheet.absoluteFillObject}
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
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View style={[styles.logoIcon, { backgroundColor: colors.primaryBlue + '15', borderColor: colors.primaryBlue + '30', borderWidth: 1 }]}>
                            <Ionicons name="car-sport" size={48} color={isDarkMode ? colors.primaryCyan : colors.primaryBlue} />
                        </View>
                        <Text style={[styles.logoText, { color: colors.textPrimary }]}>
                            Fleet<Text style={{ color: colors.primaryBlue }}>Man</Text>
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Fleet Management System
                        </Text>
                    </View>

                    {/* Login Form */}
                    <View style={[
                        styles.formCard,
                        {
                            backgroundColor: colors.surfaceCard,
                            borderColor: colors.borderGlass,
                            shadowColor: isDarkMode ? '#000' : colors.primaryBlue,
                            shadowOpacity: isDarkMode ? 0 : 0.05,
                            shadowRadius: 15,
                            elevation: isDarkMode ? 0 : 4
                        }
                    ]}>
                        <Text style={[styles.formTitle, { color: colors.textPrimary }]}>{t('auth.login.title')}</Text>
                        <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>{t('auth.login.subtitle')}</Text>

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('form.email')}</Text>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: isDarkMode ? colors.surfaceGlass : '#f8fafc',
                                    borderColor: errors.email ? colors.errorBorder : colors.borderGlass
                                }
                            ]}>
                                <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary }]}
                                    placeholder="email@example.com"
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
                            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('form.password')}</Text>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: isDarkMode ? colors.surfaceGlass : '#f8fafc',
                                    borderColor: errors.password ? colors.errorBorder : colors.borderGlass
                                }
                            ]}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
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
                            {errors.password && <Text style={[styles.errorText, { color: colors.errorText }]}>{errors.password}</Text>}
                        </View>

                        {/* Forgot Password */}
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={[styles.forgotPasswordText, { color: colors.primaryBlue }]}>{t('auth.login.forgotPassword')}</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.loginButton, { backgroundColor: colors.primaryBlue }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={[styles.loginButtonText, { color: colors.white }]}>{t('welcome.login')}</Text>
                            )}
                        </TouchableOpacity>

                        {/* Register Link */}
                        <View style={styles.registerContainer}>
                            <Text style={[styles.registerText, { color: colors.textSecondary }]}>{t('auth.login.noAccount')} </Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                                <Text style={[styles.registerLink, { color: colors.primaryBlue }]}>{t('auth.login.signUp')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    logoContainer: { alignItems: 'center', marginBottom: 40 },
    logoIcon: { width: 84, height: 84, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    logoText: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
    subtitle: { fontSize: 13, marginTop: 4, opacity: 0.8 },
    formCard: { borderRadius: 20, padding: 24, borderWidth: 1 },
    formTitle: { fontSize: 24, fontWeight: '800', marginBottom: 6, letterSpacing: -0.5 },
    formSubtitle: { fontSize: 14, marginBottom: 28 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 2 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, borderWidth: 1 },
    input: { flex: 1, paddingVertical: 14, marginLeft: 12, fontSize: 15 },
    errorText: { fontSize: 12, marginTop: 6, marginLeft: 4 },
    forgotPassword: { alignSelf: 'flex-end', marginBottom: 24 },
    forgotPasswordText: { fontSize: 13, fontWeight: '600' },
    loginButton: { paddingVertical: 18, borderRadius: 14, alignItems: 'center', marginBottom: 24 },
    loginButtonText: { fontSize: 16, fontWeight: '700' },
    registerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    registerText: { fontSize: 14 },
    registerLink: { fontSize: 14, fontWeight: '700' },
});

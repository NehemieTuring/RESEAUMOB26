/**
 * FleetMan Mobile - Forgot Password Screen
 * Matches the React web frontend design
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
import { PageHeader } from '../../src/components';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSendLink = async () => {
        setError(null);
        if (!email.trim()) {
            setError('L\'email est requis');
            return;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setError('L\'email est invalide');
            return;
        }

        setLoading(true);
        try {
            // TODO: Call API endpoint for password reset
            // await authApi.forgotPassword(email);
            
            // Mock success
            setTimeout(() => {
                setLoading(false);
                Alert.alert(
                    "Succès",
                    "Si un compte est associé à cette adresse, un email a été envoyé avec les instructions.",
                    [{ text: "OK", onPress: () => router.back() }]
                );
            }, 1000);
        } catch (e: any) {
            setLoading(false);
            Alert.alert("Erreur", e.message || "Une erreur est survenue");
        }
    };

    return (
        <ImageBackground 
            source={require('../../assets/images/login-truck-highway.jpg')} 
            style={[styles.container, { backgroundColor: colors.primaryDark }]}
            imageStyle={{ opacity: isDarkMode ? 0.8 : 0.7 }}
        >
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={isDarkMode ? ['rgba(9, 9, 11, 0.6)', 'rgba(15, 23, 42, 0.7)', 'rgba(9, 9, 11, 0.8)'] : ['rgba(248, 250, 252, 0.3)', 'rgba(255, 255, 255, 0.2)', 'rgba(241, 245, 249, 0.4)']}
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

                    {/* Main Card */}
                    <View style={[
                        styles.formCard,
                        {
                            backgroundColor: isDarkMode ? colors.surfaceCard : 'rgba(225, 228, 232, 0.95)',
                            borderColor: colors.borderGlass,
                        }
                    ]}>
                        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
                            <Text style={[styles.backLinkText, { color: colors.textSecondary }]}>Retour à la connexion</Text>
                        </TouchableOpacity>

                        <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Réinitialiser votre mot de passe</Text>
                        <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
                            Entrez votre email pour recevoir un lien de réinitialisation
                        </Text>

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Email</Text>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: isDarkMode ? colors.surfaceGlass : '#f0f3f5',
                                    borderColor: error ? colors.errorBorder : colors.borderGlass
                                }
                            ]}>
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary }]}
                                    placeholder="vous@entreprise.com"
                                    placeholderTextColor={colors.textMuted}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            {error && <Text style={[styles.errorText, { color: colors.errorText }]}>{error}</Text>}
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.submitButton, { backgroundColor: '#3b82f6' }]}
                            onPress={handleSendLink}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Envoyer le lien</Text>
                            )}
                        </TouchableOpacity>
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
    backLink: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 8 },
    backLinkText: { fontSize: 14 },
    formTitle: { fontSize: 28, fontWeight: '700', marginBottom: 12, letterSpacing: -0.5 },
    formSubtitle: { fontSize: 15, marginBottom: 32, lineHeight: 22 },
    inputGroup: { marginBottom: 24 },
    label: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginLeft: 2 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, borderWidth: 1 },
    input: { flex: 1, paddingVertical: 14, fontSize: 15 },
    errorText: { fontSize: 12, marginTop: 6, marginLeft: 4 },
    submitButton: { paddingVertical: 16, borderRadius: 24, alignItems: 'center', marginTop: 8 },
    submitButtonText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
    footerText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 'auto' },
});

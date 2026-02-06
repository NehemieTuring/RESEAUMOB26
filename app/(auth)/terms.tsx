/**
 * FleetMan Mobile - Terms Screen
 * Terms and conditions page with theme support
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function TermsScreen() {
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();

    const sections = [
        { title: 'Terms of Service', content: 'By using FleetMan, you agree to abide by these terms and conditions...' },
        { title: 'Privacy Policy', content: 'We respect your privacy and are committed to protecting your personal data...' },
        { title: 'Data Collection', content: 'We collect only the data necessary to provide our fleet management services...' },
        { title: 'User Rights', content: 'You have the right to access, modify, or delete your personal data at any time...' },
        { title: 'Service Usage', content: 'Our services are provided as-is and we reserve the right to modify or discontinue...' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.primaryDark }]}>
            <LinearGradient
                colors={isDarkMode ? ['#09090b', '#0f172a', '#09090b'] : ['#f0f9ff', '#ffffff', '#f0f9ff']}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={[styles.header, { borderBottomColor: colors.borderGlass }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Terms & Conditions</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.primaryBlue + '20' }]}>
                        <Ionicons name="document-text" size={32} color={colors.primaryBlue} />
                    </View>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>FleetMan Terms of Service</Text>
                    <Text style={[styles.lastUpdated, { color: colors.textMuted }]}>Last updated: January 2026</Text>
                </View>

                {sections.map((section, index) => (
                    <View
                        key={index}
                        style={[styles.section, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}
                    >
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{section.title}</Text>
                        <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>{section.content}</Text>
                    </View>
                ))}

                <TouchableOpacity
                    style={[styles.acceptButton, { backgroundColor: colors.primaryBlue }]}
                    onPress={() => router.back()}
                >
                    <Text style={[styles.acceptButtonText, { color: colors.white }]}>I Accept</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    placeholder: { width: 40 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 32 },
    card: { borderRadius: 16, padding: 24, borderWidth: 1, marginBottom: 16, alignItems: 'center' },
    iconContainer: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    title: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
    lastUpdated: { fontSize: 12, marginTop: 8 },
    section: { borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
    sectionContent: { fontSize: 14, lineHeight: 22 },
    acceptButton: { paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginTop: 16 },
    acceptButtonText: { fontSize: 16, fontWeight: '600' },
});

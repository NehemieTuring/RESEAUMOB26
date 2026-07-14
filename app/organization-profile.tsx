/**
 * FleetMan Mobile - Organization Profile
 * Organization profile view
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../src/context/ThemeContext';
import { DashboardHeader, OrganizationFormModal } from '../src/components';
import { adminApi, organizationApi } from '../src/services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Admin } from '../src/types';

export default function OrganizationProfileScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<Admin | null>(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const sessionUser = JSON.parse(userStr);
                const adminId = sessionUser.adminId || sessionUser.userId;

                if (adminId) {
                    const profileData = await adminApi.getById(adminId);
                    setUser(profileData);
                }
            }
        } catch (error) {
            console.error('Error fetching org profile:', error);
            Alert.alert(t('common.error'), 'Impossible de charger les informations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const InfoRow = ({ label, value, icon }: { label: string; value: string | undefined; icon: string }) => (
        <View style={[styles.infoRow, { borderBottomColor: colors.borderGlass }]}>
            <View style={[styles.infoIconContainer, { backgroundColor: colors.primaryCyan + '15' }]}>
                <Ionicons name={icon as any} size={18} color={colors.primaryCyan} />
            </View>
            <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value || '-'}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.primaryDark }]}>
                <ActivityIndicator size="large" color={colors.primaryCyan} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryDark }]} edges={['top']}>
            <DashboardHeader showSearch={false} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Profil de l'Organisation</Text>
                <TouchableOpacity onPress={() => setIsEditModalVisible(true)}>
                    <Ionicons name="pencil" size={24} color={colors.primaryCyan} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.logoSection}>
                    <View style={[styles.logoPlaceholder, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                        <Ionicons name="business" size={60} color={colors.textMuted} />
                    </View>
                    <Text style={[styles.orgName, { color: colors.textPrimary }]}>
                        {user?.organizationName}
                    </Text>
                    <Text style={[styles.orgId, { color: colors.primaryCyan }]}>
                        ID: {user?.organizationId}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>DÉTAILS DE L'ORGANISATION</Text>
                    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                        <InfoRow label={t('form.organizationName')} value={user?.organizationName} icon="business" />
                        <InfoRow label="Rôle de l'administrateur" value={user?.adminRole} icon="shield-checkmark" />
                        <InfoRow label="Pays" value={user?.personalCountry || 'Cameroun'} icon="globe" />
                        <InfoRow label="Ville" value={user?.personalCity || 'Douala'} icon="location" />
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <OrganizationFormModal
                visible={isEditModalVisible}
                onClose={() => setIsEditModalVisible(false)}
                onSuccess={fetchProfile}
                initialData={user}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    scrollContent: {
        padding: 20,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    orgName: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    orgId: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    infoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '500',
    },
});

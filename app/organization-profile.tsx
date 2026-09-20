/**
 * FleetMan Mobile - Organization Profile
 * Profil de l'organisation (admin = org) : nom, logo, contact, effectifs.
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
    Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../src/context/ThemeContext';
import { DashboardHeader, OrganizationFormModal } from '../src/components';
import { orgResourcesApi, type OrganizationProfile } from '../src/services/orgResourcesApi';
import type { FleetManager } from '../src/services/fleetManagerApi';
import { resolvePublicMediaUrl } from '../src/constants/Config';
import { useFleetRole } from '../src/hooks/useFleetRole';

export default function OrganizationProfileScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { ready, isPlatformAdmin, isDriver } = useFleetRole();
    const [loading, setLoading] = useState(true);
    const [org, setOrg] = useState<OrganizationProfile | null>(null);
    const [managers, setManagers] = useState<FleetManager[]>([]);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [orgLogo, setOrgLogo] = useState<string | null>(null);

    const applyLogo = (profile: OrganizationProfile) => {
        const path = profile.logoUrl || profile.photoUrl;
        const url = resolvePublicMediaUrl(path);
        setOrgLogo(url);
    };

    const fetchProfile = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }
            const profile = await orgResourcesApi.getProfile();
            setOrg(profile);
            applyLogo(profile);
        } catch (error) {
            console.error('Error fetching org profile:', error);
            Alert.alert(t('common.error'), 'Impossible de charger les informations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!ready) return;
        if (isDriver) {
            router.replace('/driver/home');
            return;
        }
        fetchProfile();
        orgResourcesApi.getManagers().then(setManagers).catch(() => setManagers([]));
    }, [ready, isDriver]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à vos photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            try {
                const asset = result.assets[0];
                const newUri = asset.uri;
                const rawName = asset.fileName || newUri.split('/').pop() || 'org_logo.jpg';
                const fileName = rawName.includes('.') ? rawName.split('?')[0] : `${rawName.split('?')[0]}.jpg`;
                const mimeType = asset.mimeType || 'image/jpeg';

                const updated = await orgResourcesApi.uploadLogo(newUri, mimeType, fileName);
                setOrg(updated);
                const imageUrl = resolvePublicMediaUrl(updated.logoUrl) || newUri;
                setOrgLogo(imageUrl.includes('?') ? imageUrl : `${imageUrl}?t=${Date.now()}`);
                Alert.alert(t('common.success'), t('profile.logoUpdated'));
            } catch (error) {
                console.error('Error uploading org logo:', error);
                Alert.alert(t('common.error'), t('profile.logoError'));
            }
        }
    };

    const InfoRow = ({ label, value, icon, last }: { label: string; value?: string | number | null; icon: string; last?: boolean }) => (
        <View style={[styles.infoRow, { borderBottomColor: colors.borderGlass, borderBottomWidth: last ? 0 : 1 }]}>
            <View style={[styles.infoIconContainer, { backgroundColor: colors.primaryCyan + '15' }]}>
                <Ionicons name={icon as any} size={18} color={colors.primaryCyan} />
            </View>
            <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value ?? '-'}</Text>
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

    const ownerName = [org?.firstName, org?.lastName].filter(Boolean).join(' ').trim();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryDark }]} edges={['top']}>
            <DashboardHeader showSearch={false} onRefresh={() => fetchProfile(true)} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('profile.orgTitle')}</Text>
                {isPlatformAdmin ? (
                    <TouchableOpacity onPress={() => org && setIsEditModalVisible(true)}>
                        <Ionicons name="pencil" size={24} color={colors.primaryCyan} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.backButton} />
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.logoSection}>
                    {isPlatformAdmin ? (
                    <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
                        <View style={styles.logoClip}>
                            {orgLogo ? (
                                <Image source={{ uri: orgLogo }} style={styles.logoImage} resizeMode="cover" />
                            ) : (
                                <View style={[styles.logoPlaceholder, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                                    <Ionicons name="business" size={60} color={colors.textMuted} />
                                </View>
                            )}
                        </View>
                        <View style={[styles.editBadge, { backgroundColor: colors.primaryCyan }]}>
                            <Ionicons name="camera" size={16} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    ) : (
                    <View style={styles.photoContainer}>
                        <View style={styles.logoClip}>
                            {orgLogo ? (
                                <Image source={{ uri: orgLogo }} style={styles.logoImage} resizeMode="cover" />
                            ) : (
                                <View style={[styles.logoPlaceholder, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                                    <Ionicons name="business" size={60} color={colors.textMuted} />
                                </View>
                            )}
                        </View>
                    </View>
                    )}
                    <Text style={[styles.orgName, { color: colors.textPrimary }]}>
                        {org?.organizationName || t('form.organizationName')}
                    </Text>
                    <Text style={[styles.orgId, { color: colors.primaryCyan }]}>
                        {t('profile.orgId')}: {org?.adminId || '-'}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile.orgDetails')}</Text>
                    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                        <InfoRow label={t('form.organizationName')} value={org?.organizationName} icon="business" />
                        <InfoRow label={t('profile.orgOwner')} value={ownerName || '-'} icon="person" />
                        <InfoRow label={t('form.email')} value={org?.email} icon="mail" />
                        <InfoRow label={t('form.phone')} value={org?.phone} icon="call" />
                        <InfoRow label={t('profile.managers')} value={org?.managerCount} icon="people" />
                        <InfoRow label={t('profile.fleets')} value={org?.fleetCount} icon="layers" />
                        <InfoRow label={t('profile.vehicles')} value={org?.vehicleCount} icon="car" />
                        <InfoRow last label={t('profile.drivers')} value={org?.driverCount} icon="speedometer" />
                    </View>
                </View>

                {managers.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile.managers')}</Text>
                        <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                            {managers.map((m, index) => (
                                <InfoRow
                                    key={m.managerId || `${m.managerEmail}-${index}`}
                                    label={[m.managerFirstName, m.managerLastName].filter(Boolean).join(' ') || m.managerEmail || '-'}
                                    value={m.managerEmail || m.adminName || '-'}
                                    icon="person"
                                    last={index === managers.length - 1}
                                />
                            ))}
                        </View>
                    </View>
                ) : null}

                <View style={{ height: 40 }} />
            </ScrollView>

            {isPlatformAdmin && org ? (
                <OrganizationFormModal
                    visible={isEditModalVisible}
                    onClose={() => setIsEditModalVisible(false)}
                    onSuccess={() => {
                        setIsEditModalVisible(false);
                        fetchProfile();
                    }}
                    initialData={{
                        name: org.organizationName,
                        logo: orgLogo,
                        phone: org.phone || undefined,
                    }}
                />
            ) : null}
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
        flex: 1,
        textAlign: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    photoContainer: {
        position: 'relative',
        marginBottom: 16,
        width: 120,
        height: 120,
    },
    logoClip: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
    },
    logoImage: {
        width: 120,
        height: 120,
    },
    logoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    orgName: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
        textAlign: 'center',
    },
    orgId: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.3,
        textAlign: 'center',
        paddingHorizontal: 16,
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

/**
 * FleetMan Mobile - Profile Screen
 * Displays connected user information and allows profile photo upload
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../src/context/ThemeContext';
import { DashboardHeader } from '../src/components';
import { authApi } from '../src/api';
import { accountApi } from '../src/services';
import { resolvePublicMediaUrl } from '../src/constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { roleLabelKey, resolveFleetRole } from '../src/api/roles';

type AdminPersonalInfo = {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
    lastLoginAt: string | null;
    photoUrl: string | null;
};

function formatLastLogin(value: string | null, locale: string, neverLabel: string): string {
    if (!value) {
        return neverLabel;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleString(locale.startsWith('en') ? 'en-GB' : 'fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export default function ProfileScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<AdminPersonalInfo | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const applyPhoto = (path?: string | null) => {
        const imageUrl = resolvePublicMediaUrl(path);
        if (imageUrl) {
            setProfileImage(imageUrl);
        }
        return imageUrl;
    };

    const fetchProfile = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }
            const userStr = await AsyncStorage.getItem('user');
            if (!userStr) {
                return;
            }
            const sessionUser = JSON.parse(userStr);
            const names = `${sessionUser.fullName || ''}`.trim().split(/\s+/);
            const sessionPhoto = sessionUser.profilePhotoUrl || null;

            setUser({
                firstName: sessionUser.firstName || names[0] || '',
                lastName: sessionUser.lastName || names.slice(1).join(' '),
                username: sessionUser.username || '',
                email: sessionUser.email?.includes('test.com') ? '' : (sessionUser.email || ''),
                phone: sessionUser.phone || '',
                role: sessionUser.role || sessionUser.userType || '',
                isActive: sessionUser.isActive !== false,
                lastLoginAt: sessionUser.lastLoginAt || null,
                photoUrl: sessionPhoto,
            });
            applyPhoto(sessionPhoto);

            try {
                const profileData = await authApi.getMe();
                const photoUrl = profileData.photoUrl || sessionPhoto;
                setUser({
                    firstName: profileData.firstName || names[0] || '',
                    lastName: profileData.lastName || names.slice(1).join(' '),
                    username: profileData.username || sessionUser.username || '',
                    email: profileData.email || (sessionUser.email?.includes('test.com') ? '' : sessionUser.email) || '',
                    phone: profileData.phone || sessionUser.phone || '',
                    role: profileData.roles?.[0] || sessionUser.role || sessionUser.userType || '',
                    isActive: profileData.isActive !== false,
                    lastLoginAt: profileData.lastLoginAt || sessionUser.lastLoginAt || null,
                    photoUrl,
                });
                applyPhoto(photoUrl);

                if (sessionUser.profilePhotoUrl !== photoUrl || sessionUser.phone !== (profileData.phone || sessionUser.phone)) {
                    sessionUser.profilePhotoUrl = photoUrl;
                    sessionUser.phone = profileData.phone || sessionUser.phone;
                    sessionUser.username = profileData.username || sessionUser.username;
                    sessionUser.firstName = profileData.firstName || sessionUser.firstName;
                    sessionUser.lastName = profileData.lastName || sessionUser.lastName;
                    await AsyncStorage.setItem('user', JSON.stringify(sessionUser));
                    DeviceEventEmitter.emit('userProfileUpdated');
                }
            } catch (apiError) {
                console.log('Utilisation des données de session suite à erreur API:', apiError);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            Alert.alert(t('common.error'), 'Impossible de charger les informations du profil');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

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
                const rawName = asset.fileName || newUri.split('/').pop() || 'profile.jpg';
                const fileName = rawName.includes('.') ? rawName.split('?')[0] : `${rawName.split('?')[0]}.jpg`;
                const mimeType = asset.mimeType || 'image/jpeg';

                const updatedUser = await accountApi.uploadPhoto(newUri, mimeType, fileName);
                const imageUrl = resolvePublicMediaUrl(updatedUser.photoUrl) || newUri;
                setProfileImage(imageUrl.includes('?') ? imageUrl : `${imageUrl}?t=${Date.now()}`);
                setUser((prev) => prev ? { ...prev, photoUrl: updatedUser.photoUrl } : prev);

                const userStr = await AsyncStorage.getItem('user');
                if (userStr) {
                    const sessionUser = JSON.parse(userStr);
                    sessionUser.profilePhotoUrl = updatedUser.photoUrl;
                    await AsyncStorage.setItem('user', JSON.stringify(sessionUser));
                    DeviceEventEmitter.emit('userProfileUpdated');
                }

                Alert.alert(t('common.success'), 'Photo de profil mise à jour');
            } catch (error) {
                console.error('Error uploading photo:', error);
                Alert.alert('Erreur', 'Impossible de mettre à jour la photo de profil');
            }
        }
    };

    const InfoRow = ({ label, value, icon, last }: { label: string; value: string | undefined; icon: string; last?: boolean }) => (
        <View style={[styles.infoRow, { borderBottomColor: colors.borderGlass, borderBottomWidth: last ? 0 : 1 }]}>
            <View style={[styles.infoIconContainer, { backgroundColor: colors.primaryBlue + '15' }]}>
                <Ionicons name={icon as any} size={18} color={colors.primaryBlue} />
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
                <ActivityIndicator size="large" color={colors.primaryBlue} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryDark }]} edges={['top']}>
            <DashboardHeader showSearch={false} onRefresh={() => fetchProfile(true)} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('profile.title')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.photoSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
                        <View style={styles.photoClip}>
                            {profileImage ? (
                                <Image
                                    source={{ uri: profileImage }}
                                    style={styles.photo}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.photoPlaceholder, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                                    <Ionicons name="person-outline" size={60} color={colors.textMuted} />
                                </View>
                            )}
                        </View>
                        <View style={[styles.editBadge, { backgroundColor: colors.primaryBlue }]}>
                            <Ionicons name="camera" size={16} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.userName, { color: colors.textPrimary }]}>
                        {user?.firstName} {user?.lastName}
                    </Text>
                    <Text style={[styles.userRole, { color: colors.primaryBlue }]}>
                        {t(roleLabelKey(resolveFleetRole({
                            role: user?.role,
                            userType: user?.role,
                        })))}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile.personalInfo')}</Text>
                    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                        <InfoRow label={t('form.firstName')} value={user?.firstName} icon="person-outline" />
                        <InfoRow label={t('form.lastName')} value={user?.lastName} icon="person" />
                        <InfoRow label={t('profile.username')} value={user?.username} icon="at" />
                        <InfoRow label={t('form.email')} value={user?.email} icon="mail" />
                        <InfoRow label={t('form.phone')} value={user?.phone} icon="call" />
                        <InfoRow
                            label={t('profile.accountStatus')}
                            value={user?.isActive ? t('common.active') : t('common.inactive')}
                            icon="shield-checkmark-outline"
                        />
                        <InfoRow
                            last
                            label={t('profile.lastLogin')}
                            value={formatLastLogin(user?.lastLoginAt ?? null, i18n.language, t('profile.neverConnected'))}
                            icon="time-outline"
                        />
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
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
    photoSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    photoContainer: {
        position: 'relative',
        marginBottom: 16,
        width: 120,
        height: 120,
    },
    photoClip: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
    },
    photo: {
        width: 120,
        height: 120,
    },
    photoPlaceholder: {
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
    userName: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
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

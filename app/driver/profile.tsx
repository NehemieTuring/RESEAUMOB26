/**
 * FleetMan Mobile - Driver Profile
 * Affiche les champs réels de fleet.users + fleet.drivers.
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
    Platform,
    DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { DashboardHeader, FormInput, Button, ConfirmModal } from '../../src/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { authApi, resolveDriverWorkspace } from '../../src/api';
import { accountApi } from '../../src/services';
import { resolvePublicMediaUrl } from '../../src/constants/Config';

type DriverPersonalInfo = {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone: string;
    licenceNumber: string;
    accountActive: boolean;
    driverStatus: string;
    lastLoginAt: string | null;
    approvalStatus: string;
    fleetName: string;
    assignedVehicleLabel: string;
    onActiveTrip: boolean;
    photoUrl: string | null;
};

function formatDateTime(value: string | null, locale: string, neverLabel: string): string {
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

function approvalLabel(status: string, t: (key: string) => string): string {
    const key = status.toUpperCase();
    if (key === 'APPROVED') return t('driverProfile.approvalApproved');
    if (key === 'PENDING') return t('driverProfile.approvalPending');
    if (key === 'REJECTED') return t('driverProfile.approvalRejected');
    return status || '-';
}

function vehicleLabelFromWorkspace(vehicle: {
    brand?: string | null;
    model?: string | null;
    licensePlate?: string | null;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleRegistrationNumber?: string;
} | null): string {
    if (!vehicle) {
        return '';
    }
    const make = vehicle.brand || vehicle.vehicleMake || '';
    const model = vehicle.model || vehicle.vehicleModel || '';
    const plate = vehicle.licensePlate || vehicle.vehicleRegistrationNumber || '';
    const name = `${make} ${model}`.trim();
    if (plate) {
        return name ? `${name} (${plate})` : plate;
    }
    return name;
}

export default function DriverProfileScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [user, setUser] = useState<DriverPersonalInfo | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ phone: '' });

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
                licenceNumber: sessionUser.licenceNumber || sessionUser.driverLicense || '',
                accountActive: sessionUser.isActive !== false,
                driverStatus: sessionUser.status || (sessionUser.isActive === false ? 'INACTIVE' : 'ACTIVE'),
                lastLoginAt: sessionUser.lastLoginAt || null,
                approvalStatus: sessionUser.approvalStatus || '',
                fleetName: sessionUser.fleetName || '',
                assignedVehicleLabel: '',
                onActiveTrip: false,
                photoUrl: sessionPhoto,
            });
            applyPhoto(sessionPhoto);

            const [profileData, workspace] = await Promise.all([
                authApi.getMe().catch(() => null),
                resolveDriverWorkspace().catch(() => null),
            ]);

            const driver = workspace?.driver;
            const vehicle = workspace?.vehicle ?? null;
            const photoUrl = profileData?.photoUrl || driver?.photoUrl || sessionPhoto;
            const assignedVehicleLabel =
                driver?.assignedVehicleLabel
                || vehicleLabelFromWorkspace(vehicle)
                || '';

            setUser({
                firstName: profileData?.firstName || driver?.driverFirstName || sessionUser.firstName || names[0] || '',
                lastName: profileData?.lastName || driver?.driverLastName || sessionUser.lastName || names.slice(1).join(' '),
                username: profileData?.username || driver?.username || sessionUser.username || '',
                email: profileData?.email || driver?.driverEmail || (sessionUser.email?.includes('test.com') ? '' : sessionUser.email) || '',
                phone: profileData?.phone || driver?.driverPhoneNumber || sessionUser.phone || '',
                licenceNumber: profileData?.licenceNumber || driver?.driverLicenseNumber || sessionUser.licenceNumber || '',
                accountActive: profileData?.isActive !== false && driver?.isActive !== false,
                driverStatus: driver?.driverStatus || (profileData?.isActive === false ? 'INACTIVE' : 'ACTIVE'),
                lastLoginAt: profileData?.lastLoginAt || driver?.lastLoginAt || sessionUser.lastLoginAt || null,
                approvalStatus: driver?.approvalStatus || sessionUser.approvalStatus || '',
                fleetName: driver?.fleetName || '',
                assignedVehicleLabel,
                onActiveTrip: driver?.onActiveTrip === true || !!workspace?.activeTrip,
                photoUrl,
            });
            applyPhoto(photoUrl);
            setFormData({ phone: profileData?.phone || driver?.driverPhoneNumber || sessionUser.phone || '' });

            if (photoUrl && sessionUser.profilePhotoUrl !== photoUrl) {
                sessionUser.profilePhotoUrl = photoUrl;
                sessionUser.phone = profileData?.phone || sessionUser.phone;
                sessionUser.username = profileData?.username || sessionUser.username;
                sessionUser.firstName = profileData?.firstName || sessionUser.firstName;
                sessionUser.lastName = profileData?.lastName || sessionUser.lastName;
                sessionUser.licenceNumber = profileData?.licenceNumber || driver?.driverLicenseNumber || sessionUser.licenceNumber;
                sessionUser.vehicleId = workspace?.vehicleId || sessionUser.vehicleId;
                await AsyncStorage.setItem('user', JSON.stringify(sessionUser));
                DeviceEventEmitter.emit('userProfileUpdated');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
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
            Alert.alert(t('driverProfile.permissionRequired'), t('driverProfile.permissionMessage'));
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
                const newUri = result.assets[0].uri;
                const fileName = newUri.split('/').pop() || 'profile.jpg';
                const mimeType = 'image/jpeg';

                const updatedUser = await accountApi.uploadPhoto(newUri, mimeType, fileName);
                const imageUrl = resolvePublicMediaUrl(updatedUser.photoUrl) || newUri;
                setProfileImage(imageUrl.includes('?') ? imageUrl : `${imageUrl}?t=${Date.now()}`);
                setUser((prev) => (prev ? { ...prev, photoUrl: updatedUser.photoUrl } : prev));

                const userStr = await AsyncStorage.getItem('user');
                if (userStr) {
                    const sessionUser = JSON.parse(userStr);
                    sessionUser.profilePhotoUrl = updatedUser.photoUrl;
                    await AsyncStorage.setItem('user', JSON.stringify(sessionUser));
                    DeviceEventEmitter.emit('userProfileUpdated');
                }

                Alert.alert(t('common.success'), t('driverProfile.photoUpdated'));
            } catch (error) {
                console.error('Error uploading photo:', error);
                Alert.alert('Erreur', 'Impossible de mettre à jour la photo de profil');
            }
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await accountApi.updateProfile({ phone: formData.phone });
            setUser((prev) => (prev ? { ...prev, phone: updated.phone || formData.phone } : prev));
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const sessionUser = JSON.parse(userStr);
                sessionUser.phone = updated.phone || formData.phone;
                await AsyncStorage.setItem('user', JSON.stringify(sessionUser));
                DeviceEventEmitter.emit('userProfileUpdated');
            }
            setEditMode(false);
            Alert.alert(t('common.success'), t('driverProfile.saveSuccess'));
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert(t('common.error'), 'Impossible de mettre à jour le téléphone');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const performLogout = async () => {
        try {
            await authApi.logout();
            await AsyncStorage.clear();
            if (Platform.OS === 'web') {
                window.location.href = '/login';
            } else {
                router.replace('/(auth)/login');
            }
        } catch (error) {
            console.error('Logout error:', error);
            await AsyncStorage.clear();
            if (Platform.OS === 'web') {
                window.location.href = '/login';
            } else {
                router.replace('/(auth)/login');
            }
        }
    };

    const InfoRow = ({ label, value, icon, last }: { label: string; value?: string | null; icon: string; last?: boolean }) => (
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

    if (loading || !user) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.primaryDark }]}>
                <ActivityIndicator size="large" color={colors.primaryBlue} />
            </View>
        );
    }

    const isDriverActive = user.driverStatus === 'ACTIVE' && user.accountActive;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryDark }]} edges={['top']}>
            <DashboardHeader showSearch={false} onRefresh={() => fetchProfile(true)} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('driverProfile.title')}</Text>
                <TouchableOpacity onPress={() => setEditMode(!editMode)}>
                    <Ionicons name={editMode ? 'close' : 'pencil'} size={24} color={colors.primaryBlue} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.photoSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
                        <View style={{ width: 120, height: 120, position: 'relative' }}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.photo} onError={() => setProfileImage('')} />
                            ) : (
                                <View style={[styles.photoPlaceholder, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                                    <Ionicons name="person-outline" size={60} color={colors.textMuted} />
                                </View>
                            )}
                            <View style={[styles.editBadge, { backgroundColor: colors.primaryBlue }]}>
                                <Ionicons name="camera" size={16} color="#fff" />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.userName, { color: colors.textPrimary }]}>
                        {`${user.firstName} ${user.lastName}`.trim() || user.username}
                    </Text>
                    <Text style={[styles.userRole, { color: colors.primaryBlue, marginBottom: 8, marginTop: 4, textAlign: 'center', fontSize: 14, fontWeight: 'bold' }]}>
                        {t('driverProfile.conductor')}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: isDriverActive ? colors.successText + '20' : colors.errorText + '20' }]}>
                        <Ionicons name="checkmark-circle" size={14} color={isDriverActive ? colors.successText : colors.errorText} style={{ marginRight: 4 }} />
                        <Text style={[styles.statusText, { color: isDriverActive ? colors.successText : colors.errorText }]}>
                            {isDriverActive ? t('driverProfile.statusActive') : t('driverProfile.statusInactive')}
                        </Text>
                    </View>
                </View>

                {editMode ? (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('driverProfile.editProfile')}</Text>
                        <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass, padding: 16 }]}>
                            <Text style={[styles.readOnlyWarning, { color: colors.textMuted }]}>
                                {t('driverProfile.editWarning')}
                            </Text>
                            <FormInput
                                label={t('driverProfile.phone')}
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ phone: text })}
                                placeholder="Numéro de téléphone"
                                keyboardType="phone-pad"
                            />
                            <Button
                                title={t('driverProfile.saveChanges')}
                                onPress={handleSave}
                                loading={saving}
                                style={{ marginTop: 16 }}
                            />
                        </View>
                    </View>
                ) : (
                    <View>
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile.personalInfo')}</Text>
                            <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                                <InfoRow label={t('form.firstName')} value={user.firstName} icon="person-outline" />
                                <InfoRow label={t('form.lastName')} value={user.lastName} icon="person" />
                                <InfoRow label={t('profile.username')} value={user.username} icon="at" />
                                <InfoRow label={t('driverProfile.email')} value={user.email} icon="mail" />
                                <InfoRow
                                    last
                                    label={t('driverProfile.phone')}
                                    value={user.phone}
                                    icon="call"
                                />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('driverProfile.professionalInfo')}</Text>
                            <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                                <InfoRow label={t('driverProfile.driverLicense')} value={user.licenceNumber} icon="card" />
                                <InfoRow
                                    label={t('driverProfile.driverStatus')}
                                    value={user.driverStatus === 'INACTIVE' ? t('driverProfile.statusInactive') : t('driverProfile.statusActive')}
                                    icon="speedometer-outline"
                                />
                                <InfoRow
                                    label={t('profile.accountStatus')}
                                    value={user.accountActive ? t('common.active') : t('common.inactive')}
                                    icon="shield-checkmark-outline"
                                />
                                <InfoRow
                                    label={t('driverProfile.approvalStatus')}
                                    value={approvalLabel(user.approvalStatus, t)}
                                    icon="checkmark-done-outline"
                                />
                                <InfoRow
                                    last
                                    label={t('profile.lastLogin')}
                                    value={formatDateTime(user.lastLoginAt, i18n.language, t('profile.neverConnected'))}
                                    icon="time-outline"
                                />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('driverProfile.assignmentInfo')}</Text>
                            <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                                <InfoRow
                                    label={t('driverProfile.fleet')}
                                    value={user.fleetName || t('driverProfile.noneAssigned')}
                                    icon="business-outline"
                                />
                                <InfoRow
                                    label={t('driverProfile.assignedVehicle')}
                                    value={user.assignedVehicleLabel || t('driverProfile.noneAssigned')}
                                    icon="car-outline"
                                />
                                <InfoRow
                                    last
                                    label={t('driverProfile.onActiveTrip')}
                                    value={user.onActiveTrip ? t('driverProfile.yes') : t('driverProfile.no')}
                                    icon="navigate-outline"
                                />
                            </View>
                        </View>
                    </View>
                )}

                <View style={[styles.section, { marginTop: 16 }]}>
                    <TouchableOpacity
                        style={[styles.logoutButton, { backgroundColor: colors.errorBg + '20', borderColor: colors.errorText + '40' }]}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={20} color={colors.errorText} style={{ marginRight: 8 }} />
                        <Text style={[styles.logoutText, { color: colors.errorText }]}>{t('driverProfile.logout')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <ConfirmModal
                visible={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={performLogout}
                title={t('driverProfile.logout') || 'Déconnexion'}
                message={t('driverProfile.logoutConfirm') || 'Êtes-vous sûr de vouloir vous déconnecter ?'}
                confirmText={t('driverProfile.logoutAction') || 'Déconnexion'}
                type="danger"
                icon="log-out"
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
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    scrollContent: { padding: 20 },

    photoSection: { alignItems: 'center', marginBottom: 32 },
    photoContainer: { position: 'relative', marginBottom: 16 },
    photo: { width: 120, height: 120, borderRadius: 60 },
    photoPlaceholder: { width: 120, height: 120, borderRadius: 60, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    editBadge: { position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: '#00000000', alignItems: 'center', justifyContent: 'center' },
    userName: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
    userRole: { fontSize: 14, fontWeight: '700' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },

    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
    card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
    infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    infoIconContainer: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
    infoValue: { fontSize: 15, fontWeight: '500' },

    readOnlyWarning: { fontSize: 13, marginBottom: 16, fontStyle: 'italic' },

    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
    logoutText: { fontSize: 16, fontWeight: '700' },
});

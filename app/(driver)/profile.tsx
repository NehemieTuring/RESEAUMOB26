/**
 * FleetMan Mobile - Driver Profile
 * Profile view for the connected driver (Vues 1.3 & 1.4)
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
import { authApi, accountApi } from '../../src/services';
import { getApiBaseUrl } from '../../src/constants/Config';

export default function DriverProfileScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors, isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    
    // Mock user data for driver
    const [user, setUser] = useState<any>({
        fullName: '',
        email: '',
        phoneNumber: '',
        licenseNumber: '',
        cardNumber: '',
        status: 'ACTIVE',
        createdAt: null,
        address: ''
    });
    
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ phone: '', address: '' });

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const sessionUser = JSON.parse(userStr);
                const userId = sessionUser.userUuid || sessionUser.userId;
                
                if (userId) {
                    try {
                        const profileData = await authApi.me();
                        setUser((prev: any) => ({
                            ...prev,
                            fullName: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || sessionUser.fullName,
                            email: profileData.email || sessionUser.email,
                            phoneNumber: profileData.phone || '',
                            licenseNumber: profileData.licenceNumber || '',
                            status: profileData.isActive ? 'ACTIVE' : 'INACTIVE',
                            address: profileData.companyAddress || '',
                        }));
                        
                        setFormData({
                            phone: profileData.phone || '',
                            address: profileData.companyAddress || '',
                        });
                        
                        if (profileData.photoUrl) {
                            const path = profileData.photoUrl;
                            const baseUrl = getApiBaseUrl().replace('/api', '');
                            const imageUrl = path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/api/v1/files/${path}`;
                            setProfileImage(imageUrl);
                            
                            if (sessionUser.profilePhotoUrl !== profileData.photoUrl) {
                                sessionUser.profilePhotoUrl = profileData.photoUrl;
                                await AsyncStorage.setItem('user', JSON.stringify(sessionUser));
                                DeviceEventEmitter.emit('userProfileUpdated');
                            }
                        } else if (sessionUser.profilePhotoUrl) {
                            setProfileImage(sessionUser.profilePhotoUrl);
                        }
                    } catch (e) {
                        // Fallback session data if offline or error
                        setUser((prev: any) => ({
                            ...prev,
                            fullName: sessionUser.fullName || prev.fullName,
                            email: sessionUser.email?.includes('test.com') ? '' : (sessionUser.email || prev.email),
                        }));
                    }
                }
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
                setProfileImage(updatedUser.photoUrl || newUri);

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

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setUser({...user, ...formData});
            setEditMode(false);
            Alert.alert(t('common.success'), t('driverProfile.saveSuccess'));
        }, 1000);
    };

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const performLogout = async () => {
        try {
            await authApi.logout();
            await AsyncStorage.clear();
            if (Platform.OS === 'web') {
                window.location.href = '/(auth)/login';
            } else {
                router.replace('/(auth)/login');
            }
        } catch (error) {
            console.error('Logout error:', error);
            await AsyncStorage.clear();
            if (Platform.OS === 'web') {
                window.location.href = '/(auth)/login';
            } else {
                router.replace('/(auth)/login');
            }
        }
    };

    const InfoRow = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
        <View style={[styles.infoRow, { borderBottomColor: colors.borderGlass }]}>
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
            <DashboardHeader showSearch={false} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('driverProfile.title')}</Text>
                <TouchableOpacity onPress={() => setEditMode(!editMode)}>
                    <Ionicons name={editMode ? "close" : "pencil"} size={24} color={colors.primaryBlue} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Profile Picture Section */}
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
                    <Text style={[styles.userName, { color: colors.textPrimary }]}>{user.fullName}</Text>
                    <Text style={[styles.userRole, { color: colors.primaryBlue, marginBottom: 8, marginTop: 4, textAlign: 'center', fontSize: 14, fontWeight: 'bold' }]}>
                        {t('driverProfile.conductor')}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: user.status === 'ACTIVE' ? colors.successText + '20' : colors.errorText + '20' }]}>
                        <Ionicons name="checkmark-circle" size={14} color={user.status === 'ACTIVE' ? colors.successText : colors.errorText} style={{marginRight: 4}}/>
                        <Text style={[styles.statusText, { color: user.status === 'ACTIVE' ? colors.successText : colors.errorText }]}>
                            {user.status === 'ACTIVE' ? t('driverProfile.statusActive') : t('driverProfile.statusInactive')}
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
                                onChangeText={(text) => setFormData({...formData, phone: text})}
                                placeholder="Numéro de téléphone"
                                keyboardType="phone-pad"
                            />
                            <FormInput
                                label={t('driverProfile.address')}
                                value={formData.address}
                                onChangeText={(text) => setFormData({...formData, address: text})}
                                placeholder="Votre adresse complète"
                                multiline
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
                            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('driverProfile.contactInfo')}</Text>
                            <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                                <InfoRow label={t('driverProfile.email')} value={user.email} icon="mail" />
                                <InfoRow label={t('driverProfile.phone')} value={user.phoneNumber} icon="call" />
                                <InfoRow label={t('driverProfile.address')} value={user.address} icon="home" />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('driverProfile.professionalInfo')}</Text>
                            <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                                <InfoRow label={t('driverProfile.driverLicense')} value={user.licenseNumber} icon="card" />
                                <InfoRow label={t('driverProfile.professionalCard')} value={user.cardNumber} icon="briefcase" />
                                <InfoRow label={t('driverProfile.membershipDate')} value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '-'} icon="calendar" />
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
    logoutText: { fontSize: 16, fontWeight: '700' }
});

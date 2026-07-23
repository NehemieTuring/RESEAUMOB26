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
    Platform,
    DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../src/context/ThemeContext';
import { DashboardHeader } from '../src/components';
import { adminApi, authApi, accountApi } from '../src/services';
import { getApiBaseUrl } from '../src/constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Admin, GenderLabels } from '../src/types';

export default function ProfileScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors, isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<Admin | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const sessionUser = JSON.parse(userStr);
                const adminId = sessionUser.userUuid || sessionUser.adminId || sessionUser.userId;
                
                // Pré-remplir avec les données de session (utile si l'API échoue ou en mode test)
                setUser({
                    adminFirstName: sessionUser.fullName,
                    adminEmail: sessionUser.email?.includes('test.com') ? '' : sessionUser.email,
                    adminRole: sessionUser.role || sessionUser.userType,
                } as any);

                if (adminId) {
                    try {
                        const profileData = await authApi.me();
                        // On map les données reçues de /me vers la structure attendue par l'UI (Admin)
                        setUser({
                            ...profileData,
                            adminFirstName: profileData.firstName || sessionUser.fullName,
                            adminLastName: profileData.lastName,
                            adminEmail: profileData.email || (sessionUser.email?.includes('test.com') ? '' : sessionUser.email),
                            adminPhoneNumber: profileData.phone,
                            adminRole: profileData.roles?.[0] || sessionUser.role || sessionUser.userType,
                            personalCity: profileData.companyCity, // ou personalCity selon ce qui est dispo
                            personalAddress: profileData.companyAddress,
                        } as any);

                        // Setup profile image
                        if (profileData.photoUrl) {
                            const path = profileData.photoUrl;
                            if (path.startsWith('http')) {
                                setProfileImage(path);
                            } else {
                                // API_BASE_URL a la forme "http://host:port/api"
                                const baseUrl = API_BASE_URL.replace('/api', '');
                                const imageUrl = path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/api/v1/files/${path}`;
                                setProfileImage(imageUrl);
                            }
                            
                            if (sessionUser.profilePhotoUrl !== profileData.photoUrl) {
                                sessionUser.profilePhotoUrl = profileData.photoUrl;
                                await AsyncStorage.setItem('user', JSON.stringify(sessionUser));
                                DeviceEventEmitter.emit('userProfileUpdated');
                            }
                        }
                    } catch (apiError) {
                        console.log('Utilisation des données de session suite à erreur API:', apiError);
                    }
                }
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
                const newUri = result.assets[0].uri;
                const fileName = newUri.split('/').pop() || 'profile.jpg';
                const mimeType = 'image/jpeg';
                
                const updatedUser = await accountApi.uploadPhoto(newUri, mimeType, fileName);
                
                let imageUrl = updatedUser.photoUrl || newUri;
                if (updatedUser.photoUrl && !updatedUser.photoUrl.startsWith('http')) {
                    const baseUrl = getApiBaseUrl().replace('/api', '');
                    imageUrl = updatedUser.photoUrl.startsWith('/') ? `${baseUrl}${updatedUser.photoUrl}` : `${baseUrl}/api/v1/files/${updatedUser.photoUrl}`;
                }
                
                setProfileImage(imageUrl);

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

    const InfoRow = ({ label, value, icon }: { label: string; value: string | undefined; icon: string }) => (
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
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('profile.title')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Profile Picture Section */}
                <View style={styles.photoSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
                        <View style={{ width: 120, height: 120, position: 'relative' }}>
                            {profileImage ? (
                                <Image 
                                    source={{ uri: profileImage }} 
                                    style={styles.photo} 
                                    onError={() => setProfileImage('')}
                                />
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
                        {user?.adminFirstName} {user?.adminLastName}
                    </Text>
                    <Text style={[styles.userRole, { color: colors.primaryBlue }]}>
                        {(() => {
                            const r = (user?.adminRole || '').replace('ROLE_', '').toUpperCase();
                            if (['SUPER_ADMIN', 'FLEET_SUPER_ADMIN'].includes(r)) return t('adminProfile.superAdmin');
                            if (['MANAGER', 'FLEET_MANAGER', 'ORGANIZATION_MANAGER'].includes(r)) return t('adminProfile.manager');
                            return t('adminProfile.admin');
                        })()}
                    </Text>
                </View>

                {/* Personal Information Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile.personalInfo')}</Text>
                    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                        <InfoRow label={t('form.email')} value={user?.adminEmail} icon="mail" />
                        <InfoRow label={t('form.phone')} value={user?.adminPhoneNumber} icon="call" />
                        <InfoRow label={t('form.idCardNumber')} value={user?.adminIdCardNumber} icon="card" />
                        <InfoRow label={t('form.gender')} value={user?.gender ? GenderLabels[user.gender].FR : ''} icon="person" />
                        <InfoRow label={t('form.niuAdmin')} value={user?.niu} icon="barcode" />
                        <InfoRow label={t('form.taxNumber')} value={user?.taxNumber} icon="document-text" />
                        <InfoRow label={t('form.city')} value={user?.personalCity} icon="location" />
                        <InfoRow label={t('form.postalCode')} value={user?.personalPostalCode} icon="mail-open" />
                        <InfoRow label={t('form.country')} value={user?.personalCountry} icon="globe" />
                        <InfoRow label={t('form.address')} value={user?.personalAddress} icon="home" />
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
    photo: {
        width: 120,
        height: 120,
        borderRadius: 60,
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
        borderWidth: 3,
        borderColor: '#00000000', // Transparency to look better on different bgs
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

/**
 * FleetMan Mobile - Dashboard Header Component
 * Reusable header with search, theme toggle, and notifications
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal,
    Pressable,
    Image,
    Alert,
    ActivityIndicator,
    DeviceEventEmitter,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BellIcon } from './BellIcon';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { changeLanguage, AVAILABLE_LANGUAGES } from '../i18n';
import { notificationApi } from '../services/notificationApi';
import { resolvePublicMediaUrl } from '../constants/Config';
import { areaForRole, isDriver, normalizeFleetRole } from '../api/roles';
import { useSilentRefresh } from '../hooks/useSilentRefresh';


interface DashboardHeaderProps {
    searchQuery?: string;
    onSearchChange?: (text: string) => void;
    notificationCount?: number;
    showSearch?: boolean;
    showBack?: boolean;
    onBackPress?: () => void;
    onRefresh?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    searchQuery = '',
    onSearchChange,
    notificationCount = 0,
    showSearch = true,
    showBack = false,
    onBackPress,
    onRefresh,
}) => {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { colors, isDarkMode, toggleTheme, notificationsEnabled } = useTheme();
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const currentLanguage = i18n.language || 'fr';
    const [userPhoto, setUserPhoto] = useState<string | null>(null);
    const [userInitials, setUserInitials] = useState<string>('U');
    const [unreadCount, setUnreadCount] = useState(notificationCount);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        setUnreadCount(notificationCount);
    }, [notificationCount]);

    const fetchHeaderData = useCallback(async () => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            const userObj = userStr ? JSON.parse(userStr) : null;
            const role = normalizeFleetRole(userObj?.role || userObj?.userType);
            setUserRole(role);

            if (userObj?.fullName) {
                const names = userObj.fullName.split(' ');
                setUserInitials(names.map((n: string) => n[0]).join('').substring(0, 2).toUpperCase());
            } else if (userObj?.adminFirstName || userObj?.adminLastName) {
                const first = userObj.adminFirstName ? userObj.adminFirstName[0] : '';
                const last = userObj.adminLastName ? userObj.adminLastName[0] : '';
                setUserInitials((first + last).toUpperCase() || 'U');
            }
            setUserPhoto(userObj?.profilePhotoUrl || null);

            if (notificationsEnabled) {
                let count = 0;
                if (userObj) {
                    try {
                        const notifs = await notificationApi.getAll();
                        if (Array.isArray(notifs)) {
                            count = notifs.filter(n => !n.isRead).length;
                        }
                    } catch (err) {
                        console.error('Failed to fetch notifications for count', err);
                    }
                }
                setUnreadCount(count);
            }
        } catch (error) {
            console.error('Failed to fetch header data:', error);
        }
    }, [notificationsEnabled]);

    useEffect(() => {
        fetchHeaderData();
        const subscription = DeviceEventEmitter.addListener('userProfileUpdated', fetchHeaderData);
        return () => subscription.remove();
    }, [fetchHeaderData]);

    useSilentRefresh(() => {
        fetchHeaderData();
        onRefresh?.();
    });

    const handleLanguageSelect = async (langCode: string) => {
        await changeLanguage(langCode);
        setShowLanguageModal(false);
    };

    const handleProfilePress = () => {
        if (isDriver(normalizeFleetRole(userRole))) {
            router.push('/driver/profile' as any);
        } else {
            router.push('/profile' as any);
        }
    };

    return (
        <View style={[styles.topBar, { backgroundColor: colors.navBg, borderBottomColor: colors.borderGlass }]}>
            {showBack && (
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.surfaceGlass }]}
                    onPress={onBackPress || (() => router.back())}
                >
                    <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
            )}

            {showSearch && (
                <View style={[
                    styles.searchContainer,
                    {
                        backgroundColor: isDarkMode ? colors.surfaceCard : '#f8fafc',
                        borderColor: isDarkMode ? colors.primaryBlue : colors.borderGlass
                    }
                ]}>
                    <Ionicons name="search" size={18} color={colors.textMuted} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.textPrimary }]}
                        placeholder={t('common.search')}
                        placeholderTextColor={colors.textMuted}
                        value={searchQuery}
                        onChangeText={onSearchChange}
                    />
                </View>
            )}

            {!showSearch && <View style={{ flex: 1 }} />}

            <View style={styles.topBarActions}>
                <TouchableOpacity style={styles.iconButton} onPress={() => setShowLanguageModal(true)}>
                    <Ionicons name="globe-outline" size={22} color={colors.textSecondary} />
                    <Text style={[styles.langText, { color: colors.textSecondary }]}>{currentLanguage.toUpperCase()}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
                    <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={22} color={colors.textSecondary} />
                </TouchableOpacity>
                {notificationsEnabled && (
                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => {
                            const area = areaForRole(normalizeFleetRole(userRole));
                            router.push(`/${area}/notifications` as any);
                        }}
                    >
                        <BellIcon size={22} color={colors.textSecondary} />
                        {unreadCount > 0 && (
                            <View style={[styles.notificationDot, { backgroundColor: isDarkMode ? colors.errorText : '#ef4444' }]}>
                                <Text style={[styles.notificationCount, { color: colors.white }]}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}

                {/* User Profile Avatar */}
                <TouchableOpacity
                    style={[styles.orgContainer, { borderColor: colors.primaryBlue, backgroundColor: colors.surfaceGlass }]}
                    onPress={handleProfilePress}
                >
                    {userPhoto ? (
                        <Image source={{ uri: resolvePublicMediaUrl(userPhoto) || userPhoto }} style={styles.orgLogo} />
                    ) : (
                        <Text style={[styles.orgPlaceholderText, { color: colors.primaryBlue }]}>
                            {userInitials}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Language Modal */}
            <Modal visible={showLanguageModal} animationType="fade" transparent onRequestClose={() => setShowLanguageModal(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setShowLanguageModal(false)}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t('language.select')}</Text>
                        <View style={styles.modalOptions}>
                            {AVAILABLE_LANGUAGES.map((lang) => (
                                <TouchableOpacity
                                    key={lang.code}
                                    style={[
                                        styles.modalOption,
                                        { backgroundColor: colors.surfaceGlass },
                                        currentLanguage === lang.code && { backgroundColor: colors.primaryBlue + '20', borderWidth: 1, borderColor: colors.primaryBlue }
                                    ]}
                                    onPress={() => handleLanguageSelect(lang.code)}
                                >
                                    <Text style={styles.modalOptionFlag}>{lang.flag}</Text>
                                    <Text style={[styles.modalOptionText, { color: currentLanguage === lang.code ? colors.primaryBlue : colors.textPrimary }]}>
                                        {lang.name}
                                    </Text>
                                    {currentLanguage === lang.code && <Ionicons name="checkmark" size={20} color={colors.primaryBlue} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={[styles.closeModalButton, { backgroundColor: colors.surfaceGlass }]}
                            onPress={() => setShowLanguageModal(false)}
                        >
                            <Text style={[styles.closeModalButtonText, { color: colors.textPrimary }]}>{t('common.close')}</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

        </View>
    );
};

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 12,
        zIndex: 100,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        padding: 0,
    },
    topBarActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        gap: 4,
    },
    notificationButton: {
        position: 'relative',
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
    },
    langText: {
        fontSize: 12,
        fontWeight: '600',
    },
    notificationDot: {
        position: 'absolute',
        top: 4,
        right: 4,
        minWidth: 16,
        height: 16,
        paddingHorizontal: 4,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    notificationCount: {
        fontSize: 9,
        fontWeight: '700',
        lineHeight: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalOptions: {
        gap: 12,
        marginBottom: 20,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    modalOptionFlag: {
        fontSize: 24,
    },
    modalOptionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    closeModalButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    closeModalButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    orgContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginLeft: 4,
    },
    orgLogo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    orgPlaceholderText: {
        fontSize: 12,
        fontWeight: '800',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingLogoText: {
        fontSize: 12,
        fontWeight: '700',
    },
    uploadForm: {
        alignItems: 'center',
        gap: 20,
    },
    previewContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 2,
        borderStyle: 'dashed',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    previewPlaceholder: {
        alignItems: 'center',
    },
    pickButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        gap: 8,
        borderWidth: 1,
    },
    pickButtonText: {
        fontWeight: '700',
        fontSize: 15,
    },
    formActions: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
        marginTop: 10,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontWeight: '700',
        fontSize: 16,
    },
    submitButton: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    submitButtonText: {
        fontWeight: '700',
        fontSize: 16,
    },
});

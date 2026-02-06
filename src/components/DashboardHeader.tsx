/**
 * FleetMan Mobile - Dashboard Header Component
 * Reusable header with search, theme toggle, and notifications
 */

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { changeLanguage, AVAILABLE_LANGUAGES } from '../i18n';
import { adminApi, organizationApi } from '../services/authApi';
import { notificationApi } from '../services/notificationApi';
import authService from '../services/auth';
import { OrganizationFormModal } from './OrganizationFormModal';

interface DashboardHeaderProps {
    searchQuery?: string;
    onSearchChange?: (text: string) => void;
    notificationCount?: number;
    showSearch?: boolean;
    showBack?: boolean;
    onBackPress?: () => void;
    onRefresh?: () => void;
    isRefreshing?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    searchQuery = '',
    onSearchChange,
    notificationCount = 0,
    showSearch = true,
    showBack = false,
    onBackPress,
    onRefresh,
    isRefreshing = false,
}) => {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { colors, isDarkMode, toggleTheme, notificationsEnabled } = useTheme();
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const currentLanguage = i18n.language || 'fr';
    const [organizationEmoji, setOrganizationEmoji] = useState<string | null>(null);
    const [organizationLogo, setOrganizationLogo] = useState<string | null>(null);
    const [organizationName, setOrganizationName] = useState<string | null>(null);
    const [orgId, setOrgId] = useState<number | null>(null);
    const [orgData, setOrgData] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showOrgModal, setShowOrgModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(notificationCount);

    useEffect(() => {
        setUnreadCount(notificationCount);
    }, [notificationCount]);

    useEffect(() => {
        const fetchHeaderData = async () => {
            try {
                // Try to get cached user which might have organizationId
                const userStr = await AsyncStorage.getItem('user');
                const userObj = userStr ? JSON.parse(userStr) : null;
                const organizationId = userObj?.organizationId;
                const adminId = userObj?.adminId || userObj?.userId;

                console.log('[DashboardHeader] User data:', { organizationId, adminId, userObj });

                // 1. Fetch Organization Info - try multiple methods
                let org = null;

                // Method 1: Direct organizationId
                if (organizationId) {
                    try {
                        org = await organizationApi.getById(organizationId);
                        console.log('[DashboardHeader] Got org by organizationId:', org);
                    } catch (e) {
                        console.log('[DashboardHeader] Failed to get org by organizationId:', e);
                    }
                }

                // Method 2: Get organization via admin endpoint
                if (!org && adminId) {
                    try {
                        const orgResult = await adminApi.getOrganization(adminId);
                        // Check if we got a real organization (not empty object from 204)
                        if (orgResult && orgResult.organizationId) {
                            org = orgResult;
                            console.log('[DashboardHeader] Got org by adminId:', org);
                        } else {
                            console.log('[DashboardHeader] Admin has no linked organization (Method 2)');
                        }
                    } catch (e) {
                        console.log('[DashboardHeader] Failed to get org by adminId:', e);
                    }
                }

                // Method 3: Try authService user
                if (!org) {
                    const user = authService.getUser();
                    if (user && user.userId) {
                        try {
                            const orgResult = await adminApi.getOrganization(user.userId);
                            if (orgResult && orgResult.organizationId) {
                                org = orgResult;
                                console.log('[DashboardHeader] Got org by authService userId:', org);
                            }
                        } catch (e) {
                            console.log('[DashboardHeader] Failed to get org by authService userId:', e);
                        }
                    }
                }

                // Method 4: Fallback - try to get first organization
                if (!org) {
                    try {
                        const orgs = await organizationApi.getAll();
                        if (orgs && orgs.length > 0) {
                            org = orgs[0];
                            console.log('[DashboardHeader] Got first available org (Fallback):', org);
                        }
                    } catch (e) {
                        console.log('[DashboardHeader] Failed to get fallback org:', e);
                    }
                }

                if (org && org.organizationId) {
                    setOrganizationLogo(org.organizationLogo || (org as any).logoUrl);
                    setOrganizationName(org.organizationName);
                    setOrgId(org.organizationId);
                    setOrgData(org);
                    console.log('[DashboardHeader] Organization set:', org.organizationId, org.organizationName);
                } else {
                    console.log('[DashboardHeader] No valid organization found after all methods');
                }

                // 2. Fetch Notification Count if enabled
                if (notificationsEnabled) {
                    let count = 0;
                    if (userObj) {
                        if (userObj.userType === 'ADMIN' || userObj.role === 'SUPER_ADMIN' || userObj.role === 'ORGANIZATION_MANAGER') {
                            const adminId = userObj.userId || userObj.adminId;
                            if (adminId) {
                                count = await notificationApi.getUnreadCountByAdmin(adminId);
                            }
                        } else if (userObj.userType === 'FLEET_MANAGER') {
                            const managerId = userObj.userId;
                            if (managerId) {
                                count = await notificationApi.getUnreadCountByManager(managerId);
                            }
                        }
                    }
                    setUnreadCount(count);
                }
            } catch (error) {
                console.error('Failed to fetch header data:', error);
            }
        };
        fetchHeaderData();

        // Refresh count every 60 seconds if notifications are enabled
        let interval: any;
        if (notificationsEnabled) {
            interval = setInterval(fetchHeaderData, 60000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [notificationsEnabled]);

    const handleLanguageSelect = async (langCode: string) => {
        await changeLanguage(langCode);
        setShowLanguageModal(false);
    };

    const handleLogoPress = () => {
        if (!orgId) {
            Alert.alert(
                "Organisation non disponible",
                "L'identificateur de l'organisation n'a pas pu être récupéré. Veuillez vous reconnecter.",
                [{ text: "OK" }]
            );
            return;
        }
        setShowOrgModal(true);
    };

    const handleOrgUpdateSuccess = (updatedOrg: any) => {
        const newLogoUrl = updatedOrg.logoUrl || updatedOrg.organizationLogo;
        const newName = updatedOrg.organizationName;

        if (newLogoUrl) setOrganizationLogo(newLogoUrl);
        if (newName) setOrganizationName(newName);
        setOrgData(updatedOrg);

        setShowOrgModal(false);
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
                {/* Refresh Button - Always visible */}
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => {
                        if (onRefresh) {
                            onRefresh();
                        } else {
                            // Default behavior: reload the current route
                            router.replace(router.canGoBack() ? router.canGoBack as any : '/(tabs)/home' as any);
                        }
                    }}
                    disabled={isRefreshing}
                >
                    <Ionicons
                        name="refresh"
                        size={22}
                        color={isRefreshing ? colors.textMuted : colors.textSecondary}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => setShowLanguageModal(true)}>
                    <Ionicons name="globe-outline" size={22} color={colors.textSecondary} />
                    <Text style={[styles.langText, { color: colors.textSecondary }]}>{currentLanguage.toUpperCase()}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
                    <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={22} color={colors.textSecondary} />
                </TouchableOpacity>
                {notificationsEnabled && (
                    <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/(tabs)/notifications' as any)}>
                        <Ionicons name="notifications" size={22} color={colors.textSecondary} />
                        {unreadCount > 0 && (
                            <View style={[styles.notificationDot, { backgroundColor: isDarkMode ? colors.errorText : '#ef4444' }]}>
                                <Text style={[styles.notificationCount, { color: colors.white }]}>{unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}

                {/* Organization Logo */}
                <TouchableOpacity
                    style={[styles.orgContainer, { borderColor: colors.textSecondary + '40', backgroundColor: colors.surfaceGlass }]}
                    onPress={handleLogoPress}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <View style={styles.loadingOverlay}>
                            <Text style={[styles.loadingLogoText, { color: colors.primaryBlue }]}>...</Text>
                        </View>
                    ) : organizationLogo ? (
                        <Image source={{ uri: organizationLogo }} style={styles.orgLogo} />
                    ) : (
                        <Text style={[styles.orgPlaceholderText, { color: colors.textSecondary }]}>
                            Org
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

            {/* Organization Form Modal */}
            {orgId && (
                <OrganizationFormModal
                    visible={showOrgModal}
                    orgId={orgId}
                    initialData={{
                        name: organizationName || '',
                        logo: organizationLogo,
                        phone: orgData?.organizationPhone,
                        address: orgData?.organizationAddress,
                        city: orgData?.organizationCity,
                    }}
                    onClose={() => setShowOrgModal(false)}
                    onSuccess={handleOrgUpdateSuccess}
                />
            )}
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
        padding: 8,
        gap: 4,
    },
    langText: {
        fontSize: 12,
        fontWeight: '600',
    },
    notificationDot: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationCount: {
        fontSize: 10,
        fontWeight: '700',
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
        fontSize: 10,
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

/**
 * FleetMan Mobile - More Screen
 * Additional menu items with theme and i18n support
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { DashboardHeader, ConfirmModal } from '../../src/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface MenuItem {
    id: string;
    title: string;
    icon: string;
    route?: string;
    color: string;
}

export default function MoreScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors, isDarkMode, notificationsEnabled } = useTheme();
    const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
    const [userRole, setUserRole] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchRole = async () => {
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const userObj = JSON.parse(userStr);
                setUserRole(userObj?.role || userObj?.userType);
            }
        };
        fetchRole();
    }, []);

    const performLogout = async () => {
        try {
            // Clear all auth related storage
            await AsyncStorage.removeItem('isLoggedIn');
            await AsyncStorage.removeItem('user');

            // Redirect to Login screen
            if (Platform.OS === 'web') {
                window.location.href = '/(auth)/login';
            } else {
                router.replace('/(auth)/login');
            }
        } catch (error) {
            console.error('[More] Logout error:', error);
            if (Platform.OS === 'web') {
                window.location.href = '/(auth)/login';
            } else {
                router.replace('/(auth)/login');
            }
        }
    };

    const menuSections = [
        {
            title: t('more.management'),
            items: [
                userRole !== 'FLEET_MANAGER' ? { id: 'managers', title: t('navigation.managers'), icon: 'people', route: '/(tabs)/managers', color: colors.accentPurple || '#8b5cf6' } : null,
                { id: 'incidents', title: t('navigation.incidents'), icon: 'warning', route: '/(tabs)/incidents', color: colors.warningText },
                { id: 'zones', title: t('navigation.zones'), icon: 'location', route: '/(tabs)/zones', color: colors.successText },
            ].filter((item): item is any => item !== null),
        },
        {
            title: t('more.analytics'),
            items: [
                notificationsEnabled ? { id: 'notifications', title: t('notifications.title'), icon: 'notifications', route: '/(tabs)/notifications', color: colors.warningText } : null,
                { id: 'history', title: t('navigation.history'), icon: 'time', route: '/(tabs)/history', color: colors.primaryBlue },
                { id: 'reports', title: t('navigation.reports'), icon: 'bar-chart', route: '/(tabs)/reports', color: colors.primaryCyan || '#22d3ee' },
            ].filter((item): item is any => item !== null),
        },
        {
            title: t('more.account'),
            items: [
                { id: 'profile', title: t('moreMenu.myProfile'), icon: 'person', route: '/profile', color: colors.primaryBlue },
                (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'FLEET_ADMIN' || userRole === 'FLEET_SUPER_ADMIN' || userRole === 'FLEET_MANAGER') ? { id: 'org_profile', title: t('moreMenu.orgProfile'), icon: 'business', route: '/organization-profile', color: colors.primaryCyan } : null,
                { id: 'subscription', title: t('navigation.subscription'), icon: 'card', route: '/(tabs)/subscription', color: colors.accentGold || '#f59e0b' },
                { id: 'support', title: t('navigation.support'), icon: 'help-circle', route: '/(tabs)/support', color: colors.infoText },
                { id: 'settings', title: t('navigation.settings'), icon: 'settings', route: '/(tabs)/settings', color: colors.textSecondary },
                { id: 'logout', title: t('navigation.logout') || 'Déconnexion', icon: 'log-out', color: colors.errorText, isDestructive: true },
            ].filter((item): item is any => item !== null),
        },
    ];

    const handlePress = (item: any) => {
        if (item.id === 'logout') {
            setShowLogoutConfirm(true);
        } else if (item.route) {
            router.push(item.route as any);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryDark }]} edges={['top']}>
            {isDarkMode && (
                <LinearGradient
                    colors={[colors.primaryDark, '#0f172a', colors.primaryDark]}
                    style={StyleSheet.absoluteFillObject}
                />
            )}

            {/* Dashboard Header */}
            <DashboardHeader showSearch={false} />

            <View style={styles.header}>
                <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>{t('more.title')}</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {menuSections.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{section.title}</Text>
                        <View style={[styles.sectionContent, {
                            backgroundColor: colors.surfaceCard,
                            borderColor: colors.borderGlass,
                        }]}>
                            {section.items.map((item, itemIndex) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.menuItem,
                                        itemIndex < section.items.length - 1 && [
                                            styles.menuItemBorder,
                                            { borderBottomColor: colors.borderGlass }
                                        ],
                                    ]}
                                    onPress={() => handlePress(item)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: item.isDestructive ? colors.errorBg + '30' : item.color + '20' }]}>
                                        <Ionicons name={item.icon as any} size={22} color={item.isDestructive ? colors.errorText : item.color} />
                                    </View>
                                    <Text style={[styles.menuItemText, { color: item.isDestructive ? colors.errorText : colors.textPrimary }]}>{item.title}</Text>
                                    <Ionicons name="chevron-forward" size={20} color={item.isDestructive ? colors.errorText : colors.textMuted} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                <View style={styles.footer}>
                    <Text style={[styles.version, { color: colors.textMuted }]}>FleetMan v1.0.0</Text>
                </View>
            </ScrollView>

            <ConfirmModal
                visible={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={performLogout}
                title={t('auth.logout.title') || 'Déconnexion'}
                message={t('auth.logout.confirm') || 'Êtes-vous sûr de vouloir vous déconnecter ?'}
                confirmText={t('navigation.logout') || 'Déconnexion'}
                type="danger"
                icon="log-out"
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 16, paddingTop: 8 },
    pageTitle: { fontSize: 24, fontWeight: '700' },
    scrollView: { flex: 1 },
    scrollContent: { padding: 16, paddingTop: 0 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
    sectionContent: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    menuItemBorder: { borderBottomWidth: 1 },
    iconContainer: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    menuItemText: { flex: 1, fontSize: 15, fontWeight: '500' },
    footer: { alignItems: 'center', paddingVertical: 32 },
    version: { fontSize: 12 },
});

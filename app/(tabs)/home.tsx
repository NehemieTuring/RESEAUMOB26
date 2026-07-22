/**
 * FleetMan Mobile - Home Dashboard Screen
 * Main dashboard with theme and i18n support
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { vehicleApi, driverApi, fleetApi, notificationApi } from '../../src/services';
import { useTranslation } from 'react-i18next';
import { changeLanguage, AVAILABLE_LANGUAGES } from '../../src/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DashboardHeader, BackendOfflineBanner } from '../../src/components';
import { checkBackendHealth } from '../../src/services/healthCheck';

export default function HomeScreen() {
    const router = useRouter();
    const { isDarkMode, colors, toggleTheme } = useTheme();
    const { t, i18n } = useTranslation();
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notificationCount, setNotificationCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const [userData, setUserData] = useState<any>(null);

    // TODO: Fetch notifications from API when backend is ready
    // useEffect(() => { notificationApi.getAll().then(setNotifications); }, []);

    const [stats, setStats] = useState({
        totalVehicles: 0,
        activeVehicles: 0,
        totalDrivers: 0,
        alertsToday: 0,
        totalFleets: 0,
    });

    const [recentVehicles, setRecentVehicles] = useState<any[]>([]);
    const [allVehicles, setAllVehicles] = useState<any[]>([]);
    const [allDrivers, setAllDrivers] = useState<any[]>([]);
    const [allFleets, setAllFleets] = useState<any[]>([]);
    const [filteredResults, setFilteredResults] = useState<{ type: string, data: any }[]>([]);
    const [backendOnline, setBackendOnline] = useState<boolean>(true);
    const [backendError, setBackendError] = useState<string | null>(null);

    useEffect(() => {
        const initialize = async () => {
            const user = await loadUserData();
            if (user) {
                fetchDashboardData(user);
            } else {
                fetchDashboardData();
            }
        };
        initialize();
    }, []);

    const loadUserData = async () => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                setUserData(user);
                return user;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
        return null;
    };

    const fetchDashboardData = async (user?: any) => {
        try {
            setLoading(true);
            setBackendError(null);

            const currentUser = user || userData;
            
            // Fetch data from backend with correct ID resolution
            let notificationFetch;
            if (currentUser) {
                if (currentUser.userType === 'ADMIN' || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ORGANIZATION_MANAGER') {
                    const adminIdForNotif = currentUser.userUuid || currentUser.userId || currentUser.adminId;
                    notificationFetch = adminIdForNotif ? notificationApi.getByAdmin(adminIdForNotif) : notificationApi.getAll();
                } else if (currentUser.userType === 'FLEET_MANAGER') {
                    const userIdForNotif = currentUser.userUuid || currentUser.userId;
                    notificationFetch = userIdForNotif ? notificationApi.getByFleetManager(userIdForNotif) : notificationApi.getAll();
                } else {
                    notificationFetch = notificationApi.getAll();
                }
            } else {
                notificationFetch = notificationApi.getAll();
            }

            const [vehiclesRes, fleetsRes, notifsRes] = await Promise.allSettled([
                vehicleApi.getAll(),
                fleetApi.getAll(),
                notificationFetch,
            ]);

            // If we reach here, at least the network call was attempted
            setBackendOnline(true);
            setBackendError(null);

            const vehiclesData = vehiclesRes.status === 'fulfilled' ? vehiclesRes.value || [] : [];
            const fleetsData = fleetsRes.status === 'fulfilled' ? fleetsRes.value || [] : [];
            const notificationsResult = notifsRes.status === 'fulfilled' ? notifsRes.value || [] : [];

            // Filtrer les chauffeurs par flotte si l'utilisateur est un gestionnaire (contournement du backend qui renvoie tout)
            let driversData: any[] = [];
            try {
                if (currentUser && currentUser.userType === 'FLEET_MANAGER') {
                    const driversPromises = fleetsData.map((f: any) => driverApi.getAll(f.fleetId));
                    const driversArrays = await Promise.allSettled(driversPromises);
                    driversData = driversArrays
                        .filter(res => res.status === 'fulfilled')
                        .map((res: any) => res.value)
                        .flat();
                } else {
                    driversData = await driverApi.getAll() || [];
                }
            } catch (err) {
                console.warn('Failed to fetch drivers', err);
            }

            const activeVehicles = vehiclesData.filter((v: any) => v.state === 'IN_SERVICE').length;
            const unreadNotifications = notificationsResult.filter((n: any) => !n.isRead);

            setStats({
                totalVehicles: vehiclesData.length,
                activeVehicles,
                totalDrivers: driversData.length,
                alertsToday: unreadNotifications.length,
                totalFleets: fleetsData.length,
            });

            setAllVehicles(vehiclesData);
            setAllDrivers(driversData);
            setAllFleets(fleetsData);
            setRecentVehicles(vehiclesData.slice(0, 3));
            setNotificationCount(unreadNotifications.length);

        } catch (error: any) {
            console.error('Dashboard fetch error:', error);
            setBackendOnline(false);
            setBackendError(error.message || 'Erreur de connexion au serveur');
            // Clear data when backend is offline
            setStats({
                totalVehicles: 0,
                activeVehicles: 0,
                totalDrivers: 0,
                alertsToday: 0,
                totalFleets: 0,
            });
            setAllVehicles([]);
            setAllDrivers([]);
            setAllFleets([]);
            setRecentVehicles([]);
            setNotificationCount(0);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Global Search Logic
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results: { type: string, data: any }[] = [];

        // Filter Vehicles
        allVehicles.forEach(v => {
            if (v.vehicleMake?.toLowerCase().includes(query) ||
                v.vehicleModel?.toLowerCase().includes(query) ||
                v.vehicleRegistrationNumber?.toLowerCase().includes(query)) {
                results.push({ type: 'vehicle', data: v });
            }
        });

        // Filter Drivers
        allDrivers.forEach(d => {
            if (d.driverFirstName?.toLowerCase().includes(query) ||
                d.driverLastName?.toLowerCase().includes(query) ||
                d.driverEmail?.toLowerCase().includes(query)) {
                results.push({ type: 'driver', data: d });
            }
        });

        // Filter Fleets
        allFleets.forEach(f => {
            if (f.fleetName?.toLowerCase().includes(query) ||
                f.fleetDescription?.toLowerCase().includes(query)) {
                results.push({ type: 'fleet', data: f });
            }
        });

        setFilteredResults(results);
    }, [searchQuery, allVehicles, allDrivers, allFleets]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('home.greeting.morning');
        if (hour < 18) return t('home.greeting.afternoon');
        return t('home.greeting.evening');
    };

    const quickActions = [
        { id: 'addVehicle', icon: 'car-outline', label: t('home.addVehicle'), route: '/(tabs)/vehicles' },
        { id: 'addDriver', icon: 'person-add-outline', label: t('home.addDriver'), route: '/(tabs)/drivers' },
        { id: 'newTrip', icon: 'navigate-outline', label: t('home.newTrip'), route: '/(tabs)/map' },
        { id: 'reports', icon: 'bar-chart-outline', label: t('home.viewReports'), route: '/(tabs)/reports' },
    ];

    if (userData && (userData.userType === 'ADMIN' || userData.role === 'SUPER_ADMIN' || userData.role === 'ORGANIZATION_MANAGER')) {
        quickActions.push({ id: 'orgProfile', icon: 'business-outline', label: t('moreMenu.orgProfile'), route: '/organization-profile' });
    }

    const statsData = [
        { id: 'vehicles', icon: 'car', title: t('stats.totalVehicles'), value: stats.totalVehicles, color: colors.primaryBlue },
        { id: 'active', icon: 'checkmark-circle', title: t('stats.activeVehicles'), value: stats.activeVehicles, color: colors.successText },
        { id: 'drivers', icon: 'people', title: t('stats.totalDrivers'), value: stats.totalDrivers, color: colors.accentPurple || '#8b5cf6' },
        { id: 'fleets', icon: 'grid', title: t('stats.totalFleets'), value: stats.totalFleets, color: colors.accentGold || '#f59e0b' },
    ];

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.primaryDark }]}>
                <ActivityIndicator size="large" color={colors.primaryBlue} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('common.loading')}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryDark }]} edges={['top']}>
            <LinearGradient
                colors={isDarkMode
                    ? [colors.primaryDark, '#0f172a', colors.primaryDark]
                    : ['#f0f9ff', '#ffffff', '#f0f9ff']
                }
                style={StyleSheet.absoluteFillObject}
            />

            {/* Dashboard Header */}
            <DashboardHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRefresh={onRefresh}
                isRefreshing={refreshing}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryBlue} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Backend Offline Banner */}
                {!backendOnline && (
                    <BackendOfflineBanner
                        message={backendError || undefined}
                        onRetry={onRefresh}
                        isRetrying={refreshing}
                    />
                )}

                {searchQuery.trim().length > 0 ? (
                    /* Global Search Results */
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                                {t('common.searchResults')} ({filteredResults.length})
                            </Text>
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Text style={[styles.viewAllText, { color: colors.errorText || '#ef4444' }]}>{t('common.clear')}</Text>
                            </TouchableOpacity>
                        </View>

                        {filteredResults.length > 0 ? (
                            filteredResults.map((result, index) => {
                                const { type, data } = result;
                                if (type === 'vehicle') {
                                    return (
                                        <TouchableOpacity
                                            key={`v-${data.vehicleId || index}`}
                                            style={[styles.vehicleCard, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}
                                            onPress={() => router.push({ pathname: '/(tabs)/vehicles', params: { search: data.vehicleRegistrationNumber, registration: data.vehicleRegistrationNumber } } as any)}
                                        >
                                            <View style={[styles.vehicleIcon, { backgroundColor: colors.primaryBlue + '20' }]}>
                                                <Ionicons name="car" size={22} color={colors.primaryBlue} />
                                            </View>
                                            <View style={styles.vehicleInfo}>
                                                <Text style={[styles.vehicleName, { color: colors.textPrimary }]}>
                                                    {data.vehicleMake} {data.vehicleName || data.vehicleModel}
                                                </Text>
                                                <Text style={[styles.vehicleReg, { color: colors.textSecondary }]}>
                                                    {data.vehicleRegistrationNumber}
                                                </Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                        </TouchableOpacity>
                                    );
                                } else if (type === 'driver') {
                                    return (
                                        <TouchableOpacity
                                            key={`d-${data.driverId || index}`}
                                            style={[styles.vehicleCard, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}
                                            onPress={() => router.push({ pathname: '/(tabs)/drivers', params: { search: data.driverEmail, email: data.driverEmail } } as any)}
                                        >
                                            <View style={[styles.vehicleIcon, { backgroundColor: colors.accentPurple + '20' || '#8b5cf620' }]}>
                                                <Ionicons name="person" size={22} color={colors.accentPurple || '#8b5cf6'} />
                                            </View>
                                            <View style={styles.vehicleInfo}>
                                                <Text style={[styles.vehicleName, { color: colors.textPrimary }]}>
                                                    {data.driverFirstName} {data.driverLastName}
                                                </Text>
                                                <Text style={[styles.vehicleReg, { color: colors.textSecondary }]}>
                                                    {data.driverEmail}
                                                </Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                        </TouchableOpacity>
                                    );
                                } else if (type === 'fleet') {
                                    return (
                                        <TouchableOpacity
                                            key={`f-${data.fleetId || index}`}
                                            style={[styles.vehicleCard, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}
                                            onPress={() => router.push({ pathname: '/(tabs)/fleets', params: { search: data.fleetName, name: data.fleetName } } as any)}
                                        >
                                            <View style={[styles.vehicleIcon, { backgroundColor: colors.accentGold + '20' || '#f59e0b20' }]}>
                                                <Ionicons name="grid" size={22} color={colors.accentGold || '#f59e0b'} />
                                            </View>
                                            <View style={styles.vehicleInfo}>
                                                <Text style={[styles.vehicleName, { color: colors.textPrimary }]}>
                                                    {data.fleetName}
                                                </Text>
                                                <Text style={[styles.vehicleReg, { color: colors.textSecondary }]}>
                                                    {data.fleetDescription || '-'}
                                                </Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                        </TouchableOpacity>
                                    );
                                }
                                return null;
                            })
                        ) : (
                            <View style={[styles.emptyState, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                                <Ionicons name="search-outline" size={32} color={colors.textMuted} />
                                <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('common.noResults')}</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <>
                        {/* Header */}
                        <View style={styles.headerTitleContainer}>
                            <Text style={[styles.title, { color: colors.textPrimary }]}>{t('home.title')}</Text>
                            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                                {getGreeting()} {userData?.fullName?.split(' ')[0] || ''}
                            </Text>
                        </View>

                        {/* Stats Grid */}
                        <View style={styles.statsGrid}>
                            {statsData.map((stat) => (
                                <View
                                    key={stat.id}
                                    style={[
                                        styles.statCard,
                                        {
                                            backgroundColor: colors.surfaceCard,
                                            borderColor: colors.borderGlass,
                                            shadowColor: isDarkMode ? '#000' : colors.primaryBlue,
                                            shadowOpacity: isDarkMode ? 0 : 0.05,
                                            shadowRadius: 10,
                                            elevation: isDarkMode ? 0 : 2
                                        }
                                    ]}
                                >
                                    <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                                        <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                                    </View>
                                    <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stat.value}</Text>
                                    <Text style={[styles.statTitle, { color: colors.textMuted }]}>{stat.title}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Quick Actions */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('home.quickActions')}</Text>
                            <View style={styles.quickActionsGrid}>
                                {quickActions.map((action) => (
                                    <TouchableOpacity
                                        key={action.id}
                                        style={[styles.quickAction, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}
                                        onPress={() => router.push(action.route as any)}
                                    >
                                        <View style={[styles.quickActionIcon, { backgroundColor: colors.primaryBlue + '20' }]}>
                                            <Ionicons name={action.icon as any} size={24} color={colors.primaryBlue} />
                                        </View>
                                        <Text style={[styles.quickActionText, { color: colors.textSecondary }]}>{action.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Recent Vehicles */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('home.recentVehicles')}</Text>
                                <TouchableOpacity onPress={() => router.push('/(tabs)/vehicles')}>
                                    <Text style={[styles.viewAllText, { color: colors.primaryBlue }]}>{t('common.viewAll')}</Text>
                                </TouchableOpacity>
                            </View>
                            {recentVehicles.length > 0 ? (
                                recentVehicles.map((vehicle, index) => (
                                    <TouchableOpacity
                                        key={vehicle.vehicleId || index}
                                        style={[styles.vehicleCard, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}
                                        onPress={() => router.push({ pathname: '/(tabs)/vehicles', params: { search: vehicle.vehicleRegistrationNumber, registration: vehicle.vehicleRegistrationNumber } } as any)}
                                    >
                                        <View style={[styles.vehicleIcon, { backgroundColor: colors.primaryBlue + '20' }]}>
                                            <Ionicons name="car" size={22} color={colors.primaryBlue} />
                                        </View>
                                        <View style={styles.vehicleInfo}>
                                            <Text style={[styles.vehicleName, { color: colors.textPrimary }]}>
                                                {vehicle.vehicleMake} {vehicle.vehicleName}
                                            </Text>
                                            <Text style={[styles.vehicleReg, { color: colors.textSecondary }]}>
                                                {vehicle.vehicleRegistrationNumber}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={[styles.emptyState, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                                    <Ionicons name="car-outline" size={32} color={colors.textMuted} />
                                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('home.noRecentVehicles')}</Text>
                                </View>
                            )}
                        </View>
                    </>
                )}

                <View style={styles.bottomSpacing} />
            </ScrollView>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14 },
    topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
    topBarActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    iconButton: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 4 },
    langText: { fontSize: 12, fontWeight: '600' },
    notificationDot: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    notificationCount: { fontSize: 10, fontWeight: '700' },
    scrollView: { flex: 1 },
    scrollContent: { padding: 16 },
    headerTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 20,
        paddingTop: 8,
    },
    welcomeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    greeting: { fontSize: 16, fontWeight: '600' },
    title: { fontSize: 24, fontWeight: '700' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    statCard: { width: '47%', borderRadius: 12, padding: 16, borderWidth: 1 },
    statIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    statValue: { fontSize: 28, fontWeight: '700' },
    statTitle: { fontSize: 12, marginTop: 4 },
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
    viewAllText: { fontSize: 14, fontWeight: '500' },
    quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    quickAction: { width: '47%', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1 },
    quickActionIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    quickActionText: { fontSize: 12, textAlign: 'center' },
    vehicleCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10, gap: 12 },
    vehicleIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    vehicleInfo: { flex: 1 },
    vehicleName: { fontSize: 15, fontWeight: '600' },
    vehicleReg: { fontSize: 12, marginTop: 2 },
    emptyState: { alignItems: 'center', paddingVertical: 32, borderRadius: 12, borderWidth: 1 },
    emptyText: { marginTop: 8, fontSize: 14 },
    bottomSpacing: { height: 20 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { borderRadius: 16, padding: 20, width: '100%', maxWidth: 340, borderWidth: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
    modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10, marginBottom: 8 },
    modalOptionFlag: { fontSize: 24, marginRight: 12 },
    modalOptionText: { flex: 1, fontSize: 16 },
    notificationsModal: { maxHeight: '80%' },
    markAllRead: { fontSize: 13, fontWeight: '600' },
    notificationItem: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, marginBottom: 8 },
    notificationTitle: { fontSize: 14, fontWeight: '600' },
    notificationMessage: { fontSize: 13, marginTop: 4 },
    notificationTime: { fontSize: 11, marginTop: 4 },
    emptyNotifications: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, borderRadius: 10, marginBottom: 8 },
    emptyNotificationsText: { fontSize: 14, marginTop: 12 },
    closeModalButton: { marginTop: 8, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
    closeModalButtonText: { fontSize: 15, fontWeight: '600' },
});

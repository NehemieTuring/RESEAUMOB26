/**
 * FleetMan Mobile - Notifications Screen
 * Notification center with read/unread filtering and actions
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Pressable,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { notificationApi, Notification, NotificationType, NotificationPriority } from '../../src/services/notificationApi';
import { DashboardHeader, ConfirmModal, DataDetailsModal, BackendOfflineBanner } from '../../src/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkBackendHealth } from '../../src/services/healthCheck';

const { width } = Dimensions.get('window');

type FilterType = 'all' | 'unread' | 'read';

export default function NotificationsScreen() {
    const { t } = useTranslation();
    const { colors, isDarkMode, notificationsEnabled } = useTheme();
    const router = useRouter();
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [isMarkAllModalVisible, setIsMarkAllModalVisible] = useState(false);
    const [backendOnline, setBackendOnline] = useState<boolean>(true);
    const [backendError, setBackendError] = useState<string | null>(null);

    useEffect(() => {
        if (!notificationsEnabled) {
            router.replace('/(tabs)/home');
        }
    }, [notificationsEnabled]);

    const FILTERS: { key: FilterType; label: string }[] = useMemo(() => [
        { key: 'unread', label: 'Non lues' },
        { key: 'all', label: 'Toutes' },
    ], []);

    // Fetch notifications from API
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setBackendError(null);

            // Get user from storage to know current user ID and type
            const userStr = await AsyncStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            let data: Notification[] = [];

            if (user) {
                if (user.userType === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'ORGANIZATION_MANAGER') {
                    const adminId = user.userId || user.adminId;
                    if (adminId) {
                        data = await notificationApi.getByAdmin(adminId);
                    }
                } else if (user.userType === 'FLEET_MANAGER') {
                    const managerId = user.userId;
                    if (managerId) {
                        data = await notificationApi.getByFleetManager(managerId);
                    }
                } else {
                    // Fallback to generic if no specific role detected
                    data = await notificationApi.getAll();
                }
            } else {
                data = await notificationApi.getAll();
            }

            // If we reach here, backend is online
            setBackendOnline(true);
            setBackendError(null);

            // Sort by date, newest first
            const sorted = [...data].sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setNotifications(sorted);
        } catch (error: any) {
            console.error('Error fetching notifications:', error);
            setBackendOnline(false);
            setBackendError(error.message || 'Erreur de connexion au serveur');
            // Clear data when backend is offline
            setNotifications([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
    }, []);

    // Filter notifications
    const filteredNotifications = useMemo(() => {
        switch (selectedFilter) {
            case 'unread':
                return notifications.filter(n => !n.isRead);
            case 'read':
                return notifications.filter(n => n.isRead);
            default:
                return notifications;
        }
    }, [notifications, selectedFilter]);

    // Stats
    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Mark notification as read
    const markAsRead = async (notification: Notification) => {
        if (notification.isRead) return;

        try {
            await notificationApi.markAsRead(notification.notificationId);
            setNotifications(prev =>
                prev.map(n =>
                    n.notificationId === notification.notificationId
                        ? { ...n, isRead: true }
                        : n
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleShowDetails = (notification: Notification) => {
        setSelectedNotification(notification);
        setIsDetailsModalVisible(true);
        if (!notification.isRead) {
            markAsRead(notification);
        }
    };

    const confirmMarkAllAsRead = async () => {
        const unreadNotifications = notifications.filter(n => !n.isRead);
        if (unreadNotifications.length === 0) return;

        try {
            const userStr = await AsyncStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (user) {
                if (user.userType === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'ORGANIZATION_MANAGER') {
                    const adminId = user.userId || user.adminId;
                    await notificationApi.markAllAsReadByAdmin(adminId);
                } else if (user.userType === 'FLEET_MANAGER') {
                    const managerId = user.userId;
                    await notificationApi.markAllAsReadByManager(managerId);
                } else {
                    await Promise.all(unreadNotifications.map(n => notificationApi.markAsRead(n.notificationId)));
                }
            } else {
                await Promise.all(unreadNotifications.map(n => notificationApi.markAsRead(n.notificationId)));
            }

            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
        } catch (error) {
            console.error('Error marking all as read:', error);
            Alert.alert('Erreur', 'Impossible de marquer les notifications comme lues');
        } finally {
            setIsMarkAllModalVisible(false);
        }
    };

    // Delete notification - show confirmation modal
    const deleteNotification = (notification: Notification) => {
        setNotificationToDelete(notification);
        setIsDeleteModalVisible(true);
    };

    // Confirm delete notification
    const confirmDeleteNotification = async () => {
        if (!notificationToDelete) return;

        try {
            console.log(`[Notifications] Deleting notification ${notificationToDelete.notificationId}...`);
            await notificationApi.delete(notificationToDelete.notificationId);
            console.log(`[Notifications] Successfully deleted notification ${notificationToDelete.notificationId}`);
            setNotifications(prev =>
                prev.filter(n => n.notificationId !== notificationToDelete.notificationId)
            );
            Alert.alert('Succès', 'Notification supprimée');
        } catch (error: any) {
            console.error('[Notifications] Error deleting notification:', error);
            Alert.alert(
                'Erreur',
                error.message || 'Impossible de supprimer la notification'
            );
        } finally {
            setIsDeleteModalVisible(false);
            setNotificationToDelete(null);
        }
    };

    // Get notification icon and color based on type
    const getNotificationStyle = (type: NotificationType, priority: NotificationPriority) => {
        let icon: keyof typeof Ionicons.glyphMap = 'notifications';
        let color = colors.primaryBlue;

        switch (type) {
            case 'INCIDENT_ALERT':
                icon = 'warning';
                color = colors.errorText;
                break;
            case 'MAINTENANCE_REMINDER':
                icon = 'construct';
                color = colors.warningText;
                break;
            case 'LOW_BATTERY':
                icon = 'battery-dead';
                color = colors.errorText;
                break;
            case 'SPEED_LIMIT_VIOLATION':
                icon = 'speedometer';
                color = colors.warningText;
                break;
            case 'ENTERING_GEOFENCE':
            case 'SMS_FROM_GEOFENCE':
                icon = 'location';
                color = colors.successText;
                break;
            case 'SIGNAL_LOSS':
                icon = 'wifi-outline';
                color = colors.textMuted;
                break;
            default:
                icon = 'notifications';
                color = colors.primaryBlue;
        }

        // Override color for critical priority
        if (priority === 'CRITICAL') {
            color = colors.errorText;
        } else if (priority === 'HIGH') {
            color = colors.warningText;
        }

        return { icon, color };
    };

    // Format timestamp
    const formatTimestamp = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return timestamp;
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffMins < 1) return 'À l\'instant';
            if (diffMins < 60) return `Il y a ${diffMins} min`;
            if (diffHours < 24) return `Il y a ${diffHours}h`;
            if (diffDays === 1) return 'Hier';
            if (diffDays < 7) return `Il y a ${diffDays} jours`;
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        } catch {
            return timestamp;
        }
    };

    // Get priority badge
    const getPriorityBadge = (priority: NotificationPriority) => {
        const config = {
            CRITICAL: { label: 'Critique', color: colors.errorText },
            HIGH: { label: 'Haute', color: colors.warningText },
            MEDIUM: { label: 'Moyenne', color: colors.primaryBlue },
            LOW: { label: 'Basse', color: colors.textMuted },
        };
        return config[priority] || config.LOW;
    };

    const renderNotificationItem = ({ item }: { item: Notification }) => {
        const { icon, color } = getNotificationStyle(item.notificationType, item.priority);
        const priorityBadge = getPriorityBadge(item.priority);

        return (
            <View
                style={[
                    styles.notificationCard,
                    {
                        backgroundColor: item.isRead ? colors.surfaceCard : colors.surfaceGlass,
                        borderColor: item.isRead ? colors.borderGlass : color + '40',
                        borderLeftColor: color,
                    },
                ]}
            >
                {/* Main content area - clickable to show details */}
                <Pressable
                    style={styles.notificationContent}
                    onPress={() => handleShowDetails(item)}
                    onLongPress={() => deleteNotification(item)}
                >
                    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                        <Ionicons name={icon} size={24} color={color} />
                    </View>
                    <View style={styles.contentContainer}>
                        <View style={styles.headerRow}>
                            <Text
                                style={[
                                    styles.subject,
                                    { color: colors.textPrimary },
                                    !item.isRead && styles.unreadText
                                ]}
                                numberOfLines={1}
                            >
                                {item.notificationSubject}
                            </Text>
                            {!item.isRead && (
                                <View style={[styles.unreadDot, { backgroundColor: color }]} />
                            )}
                        </View>
                        <Text
                            style={[styles.content, { color: colors.textSecondary }]}
                            numberOfLines={2}
                        >
                            {item.notificationContent}
                        </Text>
                        <View style={styles.metaRow}>
                            <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                                {formatTimestamp(item.createdAt)}
                            </Text>
                            <View style={[styles.priorityBadge, { backgroundColor: priorityBadge.color + '20' }]}>
                                <Text style={[styles.priorityText, { color: priorityBadge.color }]}>
                                    {priorityBadge.label}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Pressable>

                {/* Delete button - separate touch zone */}
                <Pressable
                    style={({ pressed }) => [
                        styles.deleteButton,
                        pressed && { backgroundColor: colors.errorBg || '#fee2e2' }
                    ]}
                    onPress={() => {
                        console.log('[Notifications] Delete button pressed for notification', item.notificationId);
                        deleteNotification(item);
                    }}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Ionicons name="trash-outline" size={20} color={colors.errorText || '#ef4444'} />
                </Pressable>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={[styles.emptyState, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceGlass }]}>
                <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Aucune notification</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {selectedFilter === 'unread'
                    ? 'Vous avez lu toutes vos notifications'
                    : 'Vos notifications apparaîtront ici'
                }
            </Text>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.primaryDark }]}>
                <ActivityIndicator size="large" color={colors.primaryBlue} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('common.loading')}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryDark }]} edges={['top']}>
            {isDarkMode && (
                <LinearGradient
                    colors={[colors.primaryDark, '#0f172a', colors.primaryDark]}
                    style={StyleSheet.absoluteFillObject}
                />
            )}

            {/* Dashboard Header */}
            <DashboardHeader
                showSearch={false}
                showBack={true}
                onRefresh={onRefresh}
                isRefreshing={refreshing}
            />

            {/* Backend Offline Banner */}
            {!backendOnline && (
                <BackendOfflineBanner
                    message={backendError || undefined}
                    onRetry={onRefresh}
                    isRetrying={refreshing}
                />
            )}

            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.headerTitleContainer}>
                        <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>
                            Toutes les notifications
                        </Text>
                        {unreadCount > 0 && (
                            <View style={[styles.countBadge, { backgroundColor: colors.errorText }]}>
                                <Text style={styles.countBadgeText}>{unreadCount}</Text>
                            </View>
                        )}
                    </View>
                    {unreadCount > 0 && (
                        <TouchableOpacity
                            style={[styles.markAllButton, { backgroundColor: colors.surfaceGlass }]}
                            onPress={() => setIsMarkAllModalVisible(true)}
                        >
                            <Ionicons name="checkmark-done" size={20} color={colors.primaryBlue} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
                    {FILTERS.map((filter) => (
                        <TouchableOpacity
                            key={filter.key}
                            style={[
                                styles.filterTab,
                                selectedFilter === filter.key && {
                                    borderBottomColor: colors.primaryBlue,
                                    borderBottomWidth: 2,
                                }
                            ]}
                            onPress={() => setSelectedFilter(filter.key)}
                        >
                            <Text style={[
                                styles.filterTabText,
                                { color: colors.textSecondary },
                                selectedFilter === filter.key && { color: colors.primaryBlue, fontWeight: '600' }
                            ]}>
                                {filter.label}
                            </Text>
                            {filter.key === 'unread' && unreadCount > 0 && (
                                <View style={[styles.filterBadge, { backgroundColor: colors.errorText }]}>
                                    <Text style={styles.filterBadgeText}>{unreadCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <FlatList
                data={filteredNotifications}
                renderItem={renderNotificationItem}
                keyExtractor={(item) => item.notificationId.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryBlue} />
                }
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                visible={isDeleteModalVisible}
                onClose={() => {
                    setIsDeleteModalVisible(false);
                    setNotificationToDelete(null);
                }}
                onConfirm={confirmDeleteNotification}
                title="Supprimer la notification"
                message={`Voulez-vous vraiment supprimer la notification "${notificationToDelete?.notificationSubject}" ?`}
                confirmText="Supprimer"
                cancelText="Annuler"
                type="danger"
                icon="trash"
                requireTextConfirmation={true}
                confirmationText={notificationToDelete?.notificationSubject || ''}
            />

            {/* Mark All As Read Confirmation */}
            <ConfirmModal
                visible={isMarkAllModalVisible}
                onClose={() => setIsMarkAllModalVisible(false)}
                onConfirm={confirmMarkAllAsRead}
                title="Tout marquer comme lu"
                message={`Voulez-vous marquer les ${unreadCount} notification(s) comme lues ?`}
                confirmText="Confirmer"
                cancelText="Annuler"
                type="info"
                icon="checkmark-done"
            />

            {/* Notification Details Modal */}
            <DataDetailsModal
                visible={isDetailsModalVisible}
                onClose={() => setIsDetailsModalVisible(false)}
                title="Détails de la notification"
                description={selectedNotification?.notificationSubject}
                icon={selectedNotification ? getNotificationStyle(selectedNotification.notificationType, selectedNotification.priority).icon : 'notifications'}
                iconColor={selectedNotification ? getNotificationStyle(selectedNotification.notificationType, selectedNotification.priority).color : undefined}
                data={[
                    { label: 'Sujet', value: selectedNotification?.notificationSubject, icon: 'text-outline', fullWidth: true },
                    { label: 'Type', value: selectedNotification?.notificationType, icon: 'list-outline' },
                    { label: 'Priorité', value: selectedNotification?.priority, icon: 'flag-outline' },
                    { label: 'État', value: selectedNotification?.notificationState, icon: 'stats-chart-outline' },
                    { label: 'Date', value: selectedNotification?.createdAt ? new Date(selectedNotification.createdAt).toLocaleString() : '-', icon: 'calendar-outline', fullWidth: true },
                    { label: 'Contenu', value: selectedNotification?.notificationContent, icon: 'document-text-outline', fullWidth: true },
                    { label: 'Véhicule ID', value: selectedNotification?.vehicleId, icon: 'car-outline' },
                    { label: 'Chauffeur ID', value: selectedNotification?.driverId, icon: 'person-outline' },
                    { label: 'Zone ID', value: selectedNotification?.geofenceId, icon: 'map-outline' },
                    { label: 'Incident ID', value: selectedNotification?.incidentId, icon: 'alert-circle-outline' },
                    { label: 'Maintenance ID', value: selectedNotification?.maintenanceId, icon: 'construct-outline' },
                ]}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14 },

    // Header
    header: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
        gap: 8,
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    countBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    countBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    markAllButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Filter Tabs
    filterContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 6,
    },
    filterTabText: {
        fontSize: 14,
    },
    filterBadge: {
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 8,
    },
    filterBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },

    // List
    listContent: {
        padding: 16,
    },

    // Notification Card
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderLeftWidth: 4,
        marginBottom: 12,
        overflow: 'hidden',
    },
    notificationContent: {
        flex: 1,
        flexDirection: 'row',
        padding: 14,
        gap: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    subject: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    unreadText: {
        fontWeight: '700',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    content: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timestamp: {
        fontSize: 11,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    priorityText: {
        fontSize: 10,
        fontWeight: '600',
    },
    deleteButton: {
        padding: 16,
        paddingLeft: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        borderRadius: 12,
        borderWidth: 1,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
});

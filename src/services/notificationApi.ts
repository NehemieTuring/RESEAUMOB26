/**
 * FleetMan Mobile - Notification API Service
 * Connected to Spring Boot Backend
 */

import apiClient from './api';

export type NotificationType =
    | 'MAINTENANCE_REMINDER'
    | 'LOW_BATTERY'
    | 'SMS_FROM_GEOFENCE'
    | 'INCIDENT_ALERT'
    | 'ENTERING_GEOFENCE'
    | 'SPEED_LIMIT_VIOLATION'
    | 'SIGNAL_LOSS';

export type NotificationState = 'PENDING' | 'READ' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Notification {
    notificationId: number;
    notificationSubject: string;
    notificationContent: string;
    notificationState: NotificationState;
    notificationType: NotificationType;
    priority: NotificationPriority;
    isRead: boolean;
    createdAt: string;
    fleetManagerId: number;
    vehicleId?: number;
    driverId?: number;
    geofenceId?: number;
    incidentId?: number;
    maintenanceId?: number;
    tripId?: number;
    metadata?: Record<string, any>;
}

export interface NotificationCreate {
    notificationSubject: string;
    notificationContent: string;
    notificationType: NotificationType;
    priority?: NotificationPriority;
    fleetManagerId: number;
    vehicleId?: number;
    driverId?: number;
    geofenceId?: number;
}

interface BackendNotification {
    id?: string;
    userId?: string;
    title?: string;
    message?: string;
    type?: string;
    isRead?: boolean;
    createdAt?: string;
    notificationId?: string | number;
    notificationSubject?: string;
    notificationContent?: string;
    notificationState?: NotificationState;
    notificationType?: NotificationType;
    priority?: NotificationPriority;
    fleetManagerId?: string | number;
}

interface PagedNotifications {
    content?: BackendNotification[];
    totalElements?: number;
}

const toApp = (n: BackendNotification): Notification => ({
    notificationId: (n.notificationId ?? n.id ?? '') as unknown as number,
    notificationSubject: n.notificationSubject ?? n.title ?? '',
    notificationContent: n.notificationContent ?? n.message ?? '',
    notificationState: n.notificationState ?? (n.isRead ? 'READ' : 'PENDING'),
    notificationType: (n.notificationType ?? n.type ?? 'INCIDENT_ALERT') as NotificationType,
    priority: n.priority ?? 'MEDIUM',
    isRead: Boolean(n.isRead),
    createdAt: n.createdAt ?? '',
    fleetManagerId: (n.fleetManagerId ?? n.userId ?? '') as unknown as number,
});

const unwrapList = (raw: unknown): Notification[] => {
    if (Array.isArray(raw)) {
        return raw.map(toApp);
    }
    if (raw && typeof raw === 'object' && Array.isArray((raw as PagedNotifications).content)) {
        return (raw as PagedNotifications).content!.map(toApp);
    }
    return [];
};

const fetchMine = async (): Promise<Notification[]> =>
    unwrapList(await apiClient.get<unknown>('/v1/notifications?page=0&size=50'));

export const notificationApi = {
    // Get all notifications
    getAll: async (_adminId?: number): Promise<Notification[]> => fetchMine(),

    // Get notification by ID
    getById: async (notificationId: any): Promise<Notification> => {
        return toApp(await apiClient.get<BackendNotification>(`/v1/notifications/${notificationId}`));
    },

    // Get notifications by fleet manager
    getByFleetManager: async (_managerId: any): Promise<Notification[]> => fetchMine(),

    // Get unread notifications for fleet manager
    getUnreadByManager: async (_managerId: any): Promise<Notification[]> => {
        const list = await fetchMine();
        return list.filter((n) => !n.isRead);
    },

    // Get notifications by admin
    getByAdmin: async (_adminId: any): Promise<Notification[]> => fetchMine(),

    // Get unread notifications for admin
    getUnreadByAdmin: async (_adminId: any): Promise<Notification[]> => {
        const list = await fetchMine();
        return list.filter((n) => !n.isRead);
    },

    // Get unread count for manager
    getUnreadCountByManager: async (_managerId: any): Promise<number> => {
        const list = await fetchMine();
        return list.filter((n) => !n.isRead).length;
    },

    // Get unread count for admin
    getUnreadCountByAdmin: async (_adminId: any): Promise<number> => {
        const list = await fetchMine();
        return list.filter((n) => !n.isRead).length;
    },

    // Mark all as read for manager
    markAllAsReadByManager: async (_managerId?: any): Promise<void> => {
        await apiClient.patch('/v1/notifications/read-all', {});
    },

    // Mark all as read for admin
    markAllAsReadByAdmin: async (_adminId?: any): Promise<void> => {
        await apiClient.patch('/v1/notifications/read-all', {});
    },

    // Get notification count
    count: async (): Promise<number> => {
        const list = await fetchMine();
        return list.length;
    },

    // Create notification
    create: async (notification: NotificationCreate): Promise<Notification> => {
        return apiClient.post<Notification>('/v1/notifications', notification);
    },

    // Mark as read
    markAsRead: async (notificationId: any): Promise<Notification> => {
        return apiClient.patch<Notification>(`/v1/notifications/${notificationId}/read`, {});
    },

    // Update notification state
    updateState: async (notificationId: any, state: NotificationState): Promise<Notification> => {
        return apiClient.put<Notification>(`/v1/notifications/${notificationId}`, { notificationState: state });
    },

    // Delete notification
    delete: async (notificationId: any): Promise<void> => {
        return apiClient.delete(`/v1/notifications/${notificationId}`);
    },
};

export default notificationApi;

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

export const notificationApi = {
    // Get all notifications
    getAll: async (adminId?: number): Promise<Notification[]> => {
        const url = adminId ? '/v1/notifications' : '/v1/notifications';
        return apiClient.get<Notification[]>(url);
    },

    // Get notification by ID
    getById: async (notificationId: number): Promise<Notification> => {
        return apiClient.get<Notification>(`/v1/notifications/${notificationId}`);
    },

    // Get notifications by fleet manager
    getByFleetManager: async (managerId: number): Promise<Notification[]> => {
        return apiClient.get<Notification[]>('/v1/notifications');
    },

    // Get unread notifications for fleet manager
    getUnreadByManager: async (managerId: number): Promise<Notification[]> => {
        return apiClient.get<Notification[]>('/v1/notifications');
    },

    // Get notifications by admin
    getByAdmin: async (adminId: number): Promise<Notification[]> => {
        return apiClient.get<Notification[]>('/v1/notifications');
    },

    // Get unread notifications for admin
    getUnreadByAdmin: async (adminId: number): Promise<Notification[]> => {
        return apiClient.get<Notification[]>('/v1/notifications');
    },

    // Get unread count for manager
    getUnreadCountByManager: async (managerId: number): Promise<number> => {
        return apiClient.get<number>('/v1/notifications');
    },

    // Get unread count for admin
    getUnreadCountByAdmin: async (adminId: number): Promise<number> => {
        return apiClient.get<number>('/v1/notifications');
    },

    // Mark all as read for manager
    markAllAsReadByManager: async (managerId: number): Promise<void> => {
        return apiClient.patch('/v1/notifications', {});
    },

    // Mark all as read for admin
    markAllAsReadByAdmin: async (adminId: number): Promise<void> => {
        return apiClient.patch('/v1/notifications', {});
    },

    // Get notification count
    count: async (): Promise<number> => {
        return apiClient.get<number>('/v1/notifications');
    },

    // Create notification
    create: async (notification: NotificationCreate): Promise<Notification> => {
        return apiClient.post<Notification>('/v1/notifications', notification);
    },

    // Mark as read
    markAsRead: async (notificationId: number): Promise<Notification> => {
        return apiClient.patch<Notification>(`/v1/notifications/${notificationId}/read`, {});
    },

    // Update notification state
    updateState: async (notificationId: number, state: NotificationState): Promise<Notification> => {
        return apiClient.put<Notification>(`/v1/notifications/${notificationId}`, { notificationState: state });
    },

    // Delete notification
    delete: async (notificationId: number): Promise<void> => {
        return apiClient.delete(`/v1/notifications/${notificationId}`);
    },
};

export default notificationApi;

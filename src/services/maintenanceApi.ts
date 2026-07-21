/**
 * FleetMan Mobile - Maintenance API Service
 * Connected to Spring Boot Backend
 */

import apiClient from './api';

export interface Maintenance {
    maintenanceId: number;
    maintenanceDatetime: string;
    maintenanceLocation?: {
        type: string;
        coordinates: [number, number];
    };
    maintenanceLocationName: string;
    maintenanceSubject: string;
    maintenanceCost: number;
    maintenanceReport: string;
    vehicleId: number;
    driverId?: number;
    vehicleRegistration?: string;
    driverName?: string;
}

export interface MaintenanceCreate {
    maintenanceSubject: string;
    maintenanceCost: number;
    maintenanceReport?: string;
    maintenanceLocationName?: string;
    longitude?: number;
    latitude?: number;
    vehicleId: number;
    driverId?: number;
}

export const maintenanceApi = {
    // Get all maintenances (or filtered by adminId)
    getAll: async (adminId?: number): Promise<Maintenance[]> => {
        const url = adminId ? '/v1/maintenances' : '/v1/maintenances';
        return apiClient.get<Maintenance[]>(url);
    },

    // Get maintenance by ID
    getById: async (maintenanceId: number): Promise<Maintenance> => {
        return apiClient.get<Maintenance>(`/v1/maintenances/${maintenanceId}`);
    },

    // Get maintenances by vehicle
    getByVehicle: async (vehicleId: number): Promise<Maintenance[]> => {
        return apiClient.get<Maintenance[]>(`/v1/maintenances?vehicleId=${vehicleId}`);
    },

    // Get maintenances by driver
    getByDriver: async (driverId: number): Promise<Maintenance[]> => {
        return apiClient.get<Maintenance[]>('/v1/maintenances');
    },

    // Create maintenance
    create: async (maintenance: MaintenanceCreate): Promise<Maintenance> => {
        return apiClient.post<Maintenance>('/v1/maintenances', maintenance);
    },

    // Update maintenance
    update: async (maintenanceId: number, maintenance: Partial<MaintenanceCreate>): Promise<Maintenance> => {
        return apiClient.put<Maintenance>(`/v1/maintenances/${maintenanceId}`, maintenance);
    },

    // Delete maintenance
    delete: async (maintenanceId: number): Promise<void> => {
        return apiClient.delete(`/v1/maintenances/${maintenanceId}`);
    },
};

export default maintenanceApi;

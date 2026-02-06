/**
 * FleetMan Mobile - Fleet API Service
 * Connected to backend endpoints for fleet management
 */

import apiClient from './api';

// Fleet types matching backend DTO
export interface Fleet {
    fleetId: number;
    fleetName: string;
    fleetDescription: string;
    fleetType: string;
    fleetManagerId?: number;
    fleetManagerName?: string;
    vehiclesCount: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface FleetCreate {
    fleetName: string;
    fleetDescription?: string;
    fleetType: string;
}

export interface FleetUpdate {
    fleetName?: string;
    fleetDescription?: string;
    fleetType?: string;
}

export const fleetApi = {
    /**
     * Get all fleets for an admin (uses /fleets/admin/{adminId})
     * This fetches fleets managed by all FleetManagers of this Admin
     */
    getByAdminId: async (adminId: number): Promise<Fleet[]> => {
        return apiClient.get<Fleet[]>(`/fleets/admin/${adminId}`);
    },

    /**
     * Get fleets by fleet manager ID
     */
    getByFleetManagerId: async (fleetManagerId: number): Promise<Fleet[]> => {
        return apiClient.get<Fleet[]>(`/fleets/fleet-manager/${fleetManagerId}`);
    },

    /**
     * Get all fleets (for global view)
     */
    getAll: async (adminId?: number): Promise<Fleet[]> => {
        if (adminId) {
            return apiClient.get<Fleet[]>(`/fleets/admin/${adminId}`);
        }
        return apiClient.get<Fleet[]>('/fleets');
    },

    /**
     * Get fleet by ID
     */
    getById: async (fleetId: number): Promise<Fleet> => {
        return apiClient.get<Fleet>(`/fleets/${fleetId}`);
    },

    /**
     * Create fleet as Admin (uses /fleets/admin/{adminId})
     * Creates a fleet via the system FleetManager of the Admin
     */
    createAsAdmin: async (adminId: number, fleet: FleetCreate): Promise<Fleet> => {
        return apiClient.post<Fleet>(`/fleets/admin/${adminId}`, fleet);
    },

    /**
     * Create fleet for a specific FleetManager
     */
    createForManager: async (fleetManagerId: number, fleet: FleetCreate): Promise<Fleet> => {
        return apiClient.post<Fleet>(`/fleets/fleet-manager/${fleetManagerId}`, fleet);
    },

    /**
     * Update fleet
     */
    update: async (fleetId: number, fleet: FleetUpdate): Promise<Fleet> => {
        return apiClient.put<Fleet>(`/fleets/${fleetId}`, fleet);
    },

    /**
     * Delete fleet
     */
    delete: async (fleetId: number): Promise<void> => {
        return apiClient.delete(`/fleets/${fleetId}`);
    },

    /**
     * Count fleets
     */
    count: async (): Promise<number> => {
        return apiClient.get<number>('/fleets/count');
    },

    // Legacy method for backward compatibility
    create: async (fleet: FleetCreate & { adminId: number }): Promise<Fleet> => {
        return apiClient.post<Fleet>(`/fleets/admin/${fleet.adminId}`, {
            fleetName: fleet.fleetName,
            fleetDescription: fleet.fleetDescription,
            fleetType: fleet.fleetType,
        });
    },
};

export default fleetApi;

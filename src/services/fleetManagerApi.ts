/**
 * FleetMan Mobile - Fleet Manager API Service
 */

import apiClient from './api';
import { Gender, Language } from '../types';

// Fleet Manager types
export interface FleetManager {
    managerId: number;
    managerFirstName: string;
    managerLastName: string;
    managerEmail: string;
    managerPhoneNumber: string;
    managerIdCardNumber: string;
    personalAddress: string;
    personalCity: string;
    personalPostalCode: string;
    personalCountry: string;
    taxNumber: string;
    gender: Gender;
    niu: string;
    language: Language;
    managerState: string;
    adminId: number;
    adminName: string;
    createdAt: string;
    lastLogin: string;
    isActive: boolean;
    fleetsCount: number;
}

export interface FleetManagerCreate {
    managerEmail: string;
    managerPassword: string;
    managerLastName: string;
    managerFirstName: string;
    managerPhoneNumber?: string;
    gender?: Gender;
    managerIdCardNumber?: string;
    personalAddress?: string;
    personalCity?: string;
    personalPostalCode?: string;
    personalCountry?: string;
    taxNumber?: string;
    niu?: string;
    language?: Language;
}

export interface FleetManagerUpdate {
    managerLastName?: string;
    managerFirstName?: string;
    managerPhoneNumber?: string;
    gender?: Gender;
    managerIdCardNumber?: string;
    personalAddress?: string;
    personalCity?: string;
    personalPostalCode?: string;
    personalCountry?: string;
    taxNumber?: string;
    niu?: string;
    language?: Language;
}

export const fleetManagerApi = {
    // Get all fleet managers
    getAll: async (adminId?: number): Promise<FleetManager[]> => {
        const url = adminId ? `/fleet-managers/admin/${adminId}` : '/fleet-managers';
        return apiClient.get<FleetManager[]>(url);
    },

    // Get fleet manager by ID
    getById: async (managerId: number): Promise<FleetManager> => {
        return apiClient.get<FleetManager>(`/fleet-managers/${managerId}`);
    },

    // Get fleet managers by admin ID
    getByAdminId: async (adminId: number): Promise<FleetManager[]> => {
        return apiClient.get<FleetManager[]>(`/fleet-managers/admin/${adminId}`);
    },

    // Get fleet manager by email
    getByEmail: async (email: string): Promise<FleetManager> => {
        return apiClient.get<FleetManager>(`/fleet-managers/email/${email}`);
    },

    // Create fleet manager
    create: async (adminId: number, manager: FleetManagerCreate): Promise<FleetManager> => {
        return apiClient.post<FleetManager>(`/fleet-managers/admin/${adminId}`, manager);
    },

    // Update fleet manager
    update: async (managerId: number, manager: FleetManagerUpdate): Promise<FleetManager> => {
        return apiClient.put<FleetManager>(`/fleet-managers/${managerId}`, manager);
    },

    // Delete fleet manager
    delete: async (managerId: number): Promise<void> => {
        return apiClient.delete(`/fleet-managers/${managerId}`);
    },

    // Activate/Deactivate manager
    setActive: async (managerId: number, isActive: boolean): Promise<FleetManager> => {
        return apiClient.patch<FleetManager>(`/fleet-managers/${managerId}/status`, { isActive });
    },
};

export default fleetManagerApi;

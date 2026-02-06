/**
 * FleetMan Mobile - Driver API Service
 */

import apiClient from './api';

// Driver types matching backend DTO
export interface Driver {
    driverId: number;
    driverFirstName: string;
    driverLastName: string;
    driverEmail: string;
    driverPhoneNumber: string;
    driverEmergencyContactName?: string;
    driverEmergencyContactPhone?: string;
    driverPersonalInformation?: string;
    driverLicenseNumber?: string;
    driverLicenseExpiryDate?: string;
    driverCardNumber?: string;
    driverStatus?: string;
    fleetManagerId?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface DriverCreate {
    driverFirstName: string;
    driverLastName: string;
    driverEmail: string;
    driverPassword: string;
    driverPhoneNumber: string;
    driverEmergencyContactName?: string;
    driverEmergencyContactPhone?: string;
    driverPersonalInformation?: string;
    driverLicenseNumber?: string;
    driverLicenseExpiryDate?: string;
    driverCardNumber?: string;
    fleetManagerId?: number;
}

export interface DriverUpdate {
    driverFirstName?: string;
    driverLastName?: string;
    driverEmail?: string;
    driverPhoneNumber?: string;
    driverEmergencyContactName?: string;
    driverEmergencyContactPhone?: string;
    driverPersonalInformation?: string;
    driverLicenseNumber?: string;
    driverLicenseExpiryDate?: string;
    driverCardNumber?: string;
}

export const driverApi = {
    // Get all drivers (or filtered by adminId)
    getAll: async (adminId?: number): Promise<Driver[]> => {
        const url = adminId ? `/drivers/admin/${adminId}` : '/drivers';
        return apiClient.get<Driver[]>(url);
    },

    // Get driver by ID
    getById: async (driverId: number): Promise<Driver> => {
        return apiClient.get<Driver>(`/drivers/${driverId}`);
    },

    // Get drivers by fleet manager ID
    getByFleetManagerId: async (fleetManagerId: number): Promise<Driver[]> => {
        return apiClient.get<Driver[]>(`/drivers/fleet-manager/${fleetManagerId}`);
    },

    // Get driver by email
    getByEmail: async (email: string): Promise<Driver> => {
        return apiClient.get<Driver>(`/drivers/email/${email}`);
    },

    // Create driver
    create: async (driver: DriverCreate): Promise<Driver> => {
        return apiClient.post<Driver>('/drivers', driver);
    },

    /**
     * Create driver as Admin (uses /drivers/admin/{adminId})
     * This automatically assigns the driver to the Admin's system FleetManager
     */
    createAsAdmin: async (adminId: number, driver: Omit<DriverCreate, 'fleetManagerId'>): Promise<Driver> => {
        return apiClient.post<Driver>(`/drivers/admin/${adminId}`, driver);
    },

    // Update driver
    update: async (driverId: number, driver: DriverUpdate): Promise<Driver> => {
        return apiClient.put<Driver>(`/drivers/${driverId}`, driver);
    },

    // Delete driver
    delete: async (driverId: number): Promise<void> => {
        return apiClient.delete(`/drivers/${driverId}`);
    },

    // Update driver status
    updateStatus: async (driverId: number, status: string): Promise<Driver> => {
        return apiClient.patch<Driver>(`/drivers/${driverId}/status`, { status });
    },
};

export default driverApi;

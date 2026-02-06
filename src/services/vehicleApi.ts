/**
 * FleetMan Mobile - Vehicle API Service
 */

import apiClient from './api';

// Vehicle types matching backend
export interface Vehicle {
    vehicleId: number;
    vehicleMake: string;
    vehicleModel: string;
    vehicleRegistrationNumber: string;
    type: string;
    vehicleIdentificationNumber: string;
    vehicleDocument: string;
    vehicleDeviceIdAddress: string;
    fuelLevel: number;
    numberOfPassengers: number;
    speed: number;
    state: string;
    fuelType: string;
    fleetId: number;
    createdAt: string;
    updatedAt: string;
}

export interface VehicleCreate {
    vehicleMake: string;
    vehicleModel: string;
    vehicleRegistrationNumber: string;
    type: string;
    vehicleIdentificationNumber?: string;
    vehicleDocument?: string;
    vehicleDeviceIdAddress?: string;
    fuelLevel?: number;
    numberOfPassengers?: number;
    speed?: number;
    state: string;
    fuelType: string;
    fleetId: number;
}

export interface VehicleUpdate {
    vehicleMake?: string;
    vehicleModel?: string;
    type?: string;
    vehicleIdentificationNumber?: string;
    vehicleDocument?: string;
    vehicleDeviceIdAddress?: string;
    fuelLevel?: number;
    numberOfPassengers?: number;
    speed?: number;
    state?: string;
    fuelType?: string;
    fleetId?: number;
}

export interface VehicleGlobalStats {
    totalVehicles: number;
    inService: number;
    outOfService: number;
    parked: number;
    underMaintenance: number;
    inAlarm: number;
}

export const vehicleApi = {
    // Get all vehicles (or filtered by adminId)
    getAll: async (adminId?: number): Promise<Vehicle[]> => {
        const url = adminId ? `/vehicles/admin/${adminId}` : '/vehicles';
        return apiClient.get<Vehicle[]>(url);
    },

    // Get vehicle by ID
    getById: async (vehicleId: number): Promise<Vehicle> => {
        return apiClient.get<Vehicle>(`/vehicles/${vehicleId}`);
    },

    // Get vehicles by fleet ID
    getByFleetId: async (fleetId: number): Promise<Vehicle[]> => {
        return apiClient.get<Vehicle[]>(`/vehicles/fleet/${fleetId}`);
    },

    // Get vehicles by state
    getByState: async (state: string): Promise<Vehicle[]> => {
        return apiClient.get<Vehicle[]>(`/vehicles/state/${state}`);
    },

    // Get vehicles by type
    getByType: async (type: string): Promise<Vehicle[]> => {
        return apiClient.get<Vehicle[]>(`/vehicles/type/${type}`);
    },

    // Get vehicle by registration number
    getByRegistrationNumber: async (registrationNumber: string): Promise<Vehicle> => {
        return apiClient.get<Vehicle>(`/vehicles/registration/${registrationNumber}`);
    },

    // Create vehicle
    create: async (vehicle: VehicleCreate): Promise<Vehicle> => {
        return apiClient.post<Vehicle>('/vehicles', vehicle);
    },

    // Update vehicle
    update: async (vehicleId: number, vehicle: VehicleUpdate): Promise<Vehicle> => {
        return apiClient.put<Vehicle>(`/vehicles/${vehicleId}`, vehicle);
    },

    // Delete vehicle
    delete: async (vehicleId: number): Promise<void> => {
        return apiClient.delete(`/vehicles/${vehicleId}`);
    },

    // Get global stats
    getGlobalStats: async (adminId?: number): Promise<VehicleGlobalStats> => {
        const url = adminId ? `/vehicles/stats/global?adminId=${adminId}` : '/vehicles/stats/global';
        return apiClient.get<VehicleGlobalStats>(url);
    },

    // Count by state
    countByState: async (state: string): Promise<number> => {
        return apiClient.get<number>(`/vehicles/count/state/${state}`);
    },

    // Count by type
    countByType: async (type: string): Promise<number> => {
        return apiClient.get<number>(`/vehicles/count/type/${type}`);
    },
};

export default vehicleApi;

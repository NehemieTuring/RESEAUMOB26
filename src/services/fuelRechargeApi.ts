/**
 * FleetMan Mobile - Fuel Recharge API Service
 * Connected to Spring Boot Backend
 */

import apiClient from './api';

export type StationName = 'TOTAL_ENERGIES' | 'TRADEX' | 'ORYX' | 'ENGEN' | 'MRS' | 'OTHER';

export interface FuelRecharge {
    rechargeId: number;
    rechargeQuantity: number;
    rechargePrice: number;
    rechargeLocation?: {
        type: string;
        coordinates: [number, number];
    };
    rechargeDatetime: string;
    stationName: StationName;
    vehicleId: number;
    driverId: number;
    vehicleRegistration?: string;
    driverName?: string;
}

export interface FuelRechargeCreate {
    rechargeQuantity: number;
    rechargePrice: number;
    longitude?: number;
    latitude?: number;
    stationName: StationName;
    vehicleId: number;
    driverId: number;
}

export const fuelRechargeApi = {
    // Get all fuel recharges (or filtered by adminId)
    getAll: async (adminId?: number): Promise<FuelRecharge[]> => {
        const url = adminId ? '/v1/fuel-recharges' : '/v1/fuel-recharges';
        return apiClient.get<FuelRecharge[]>(url);
    },

    // Get fuel recharge by ID
    getById: async (rechargeId: number): Promise<FuelRecharge> => {
        return apiClient.get<FuelRecharge>(`/v1/fuel-recharges/${rechargeId}`);
    },

    // Get fuel recharges by vehicle
    getByVehicle: async (vehicleId: number): Promise<FuelRecharge[]> => {
        return apiClient.get<FuelRecharge[]>(`/v1/fuel-recharges?vehicleId=${vehicleId}`);
    },

    // Get fuel recharges by driver
    getByDriver: async (driverId: number): Promise<FuelRecharge[]> => {
        return apiClient.get<FuelRecharge[]>('/v1/fuel-recharges');
    },

    // Create fuel recharge
    create: async (recharge: FuelRechargeCreate): Promise<FuelRecharge> => {
        return apiClient.post<FuelRecharge>('/v1/fuel-recharges', recharge);
    },

    // Update fuel recharge
    update: async (rechargeId: number, recharge: Partial<FuelRechargeCreate>): Promise<FuelRecharge> => {
        return apiClient.put<FuelRecharge>(`/v1/fuel-recharges/${rechargeId}`, recharge);
    },

    // Delete fuel recharge
    delete: async (rechargeId: number): Promise<void> => {
        return apiClient.delete(`/v1/fuel-recharges/${rechargeId}`);
    },
};

export default fuelRechargeApi;

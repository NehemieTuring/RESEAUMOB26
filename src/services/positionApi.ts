/**
 * FleetMan Mobile - Position API Service
 * Connected to Spring Boot Backend - Real-time tracking
 */

import apiClient from './api';

export interface Position {
    positionId: number;
    coordinates: {
        type: string;
        coordinates: [number, number]; // [longitude, latitude]
    };
    positionDateTime: string;
    speed: number;
    heading: number;
    accuracy: number;
    isTripStart: boolean;
    isTripEnd: boolean;
    sequenceOrder: number;
    vehicleId: number;
}

export interface PositionCreate {
    longitude: number;
    latitude: number;
    speed?: number;
    heading?: number;
    accuracy?: number;
    isTripStart?: boolean;
    isTripEnd?: boolean;
    vehicleId: number;
}

export const positionApi = {
    // Get all positions
    getAll: async (): Promise<Position[]> => {
        return apiClient.get<Position[]>('/positions');
    },

    // Get position by ID
    getById: async (positionId: number): Promise<Position> => {
        return apiClient.get<Position>(`/positions/${positionId}`);
    },

    // Get positions by vehicle
    getByVehicle: async (vehicleId: number): Promise<Position[]> => {
        return apiClient.get<Position[]>(`/positions/vehicle/${vehicleId}`);
    },

    // Get latest position for vehicle
    getLatest: async (vehicleId: number): Promise<Position> => {
        return apiClient.get<Position>(`/positions/vehicle/${vehicleId}/latest`);
    },

    // Create position (send GPS update)
    create: async (position: PositionCreate): Promise<Position> => {
        return apiClient.post<Position>('/positions', position);
    },

    // Delete position
    delete: async (positionId: number): Promise<void> => {
        return apiClient.delete(`/positions/${positionId}`);
    },
};

export default positionApi;

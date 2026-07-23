/**
 * FleetMan Mobile - Trip API Service
 * Connected to Spring Boot Backend
 */

import apiClient from './api';

export type TripStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
    id: string;
    tripCode: string;
    vehicleId: string;
    driverId: string;
    fleetId: string;
    status: TripStatus;
    startDate: string;
    startTime: string;
    departureLocation?: string;
    endDate?: string;
    endTime?: string;
    missionObject?: string;
    missionCost?: number;
    driverFullName?: string;
    vehicleRegistration?: string;
}

export interface TripDetailRequest {
    itemType?: string;
    description?: string;
    quantity?: number;
    weight?: number;
}

export interface TripCreate {
    vehicleId: string;
    driverId: string;
    fleetId: string;
    startDate: string; // YYYY-MM-DD
    startTime: string; // HH:mm:ss
    departureLocation?: string;
    missionObject?: string;
    missionCost?: number;
    rateType?: string;
    details?: TripDetailRequest[];
}

export interface TripUpdate {
    startDate?: string;
    startTime?: string;
    departureLocation?: string;
    missionObject?: string;
    missionCost?: number;
}

export const tripApi = {
    // Get all trips (or filtered by fleetId)
    getAll: async (fleetId?: string): Promise<Trip[]> => {
        const url = fleetId ? `/v1/trips?fleetId=${fleetId}` : '/v1/trips';
        return apiClient.get<Trip[]>(url);
    },

    // Get trip by ID
    getById: async (tripId: string): Promise<Trip> => {
        return apiClient.get<Trip>(`/v1/trips/${tripId}`);
    },

    // Get trips by driver (history)
    myHistory: async (): Promise<Trip[]> => {
        return apiClient.get<Trip[]>('/v1/trips/my-history');
    },

    // Get active trip for driver
    myActive: async (): Promise<Trip> => {
        return apiClient.get<Trip>('/v1/trips/my-active');
    },

    // Create trip
    create: async (trip: TripCreate): Promise<Trip> => {
        return apiClient.post<Trip>('/v1/trips', trip);
    },

    // Update trip
    update: async (tripId: string, trip: TripUpdate): Promise<Trip> => {
        return apiClient.put<Trip>(`/v1/trips/${tripId}`, trip);
    },
    
    // Assign new driver
    assignDriver: async (tripId: string, newDriverId: string): Promise<Trip> => {
        return apiClient.patch<Trip>(`/v1/trips/${tripId}/driver`, { newDriverId });
    },

    // Start trip
    start: async (tripId: string): Promise<Trip> => {
        return apiClient.put<Trip>(`/v1/trips/${tripId}/start`, { });
    },

    // Complete trip
    complete: async (tripId: string): Promise<Trip> => {
        return apiClient.put<Trip>(`/v1/trips/${tripId}/complete`, { });
    },

    // Cancel trip
    cancel: async (tripId: string, reason?: string): Promise<Trip> => {
        return apiClient.put<Trip>(`/v1/trips/${tripId}/cancel`, { reason });
    },

    // Delete trip
    delete: async (tripId: string): Promise<void> => {
        return apiClient.delete(`/v1/trips/${tripId}`);
    },
};

export default tripApi;

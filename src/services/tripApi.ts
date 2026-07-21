/**
 * FleetMan Mobile - Trip API Service
 * Connected to Spring Boot Backend
 */

import apiClient from './api';

export type TripStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
    tripId: number;
    tripReference: string;
    plannedDistance: number;
    actualDistance: number | null;
    departureDatetime: string;
    arrivalDatetime: string | null;
    status: TripStatus;
    notes: string;
    driverId: number;
    vehicleId: number;
    driverName?: string;
    vehicleRegistration?: string;
}

export interface TripCreate {
    tripReference: string;
    plannedDistance: number;
    departureDatetime: string;
    status?: TripStatus;
    notes?: string;
    driverId: number;
    vehicleId: number;
}

export interface TripUpdate {
    tripReference?: string;
    plannedDistance?: number;
    actualDistance?: number;
    departureDatetime?: string;
    arrivalDatetime?: string;
    status?: TripStatus;
    notes?: string;
}

export const tripApi = {
    // Get all trips (or filtered by adminId)
    getAll: async (adminId?: number): Promise<Trip[]> => {
        const url = adminId ? '/v1/trips' : '/v1/trips';
        return apiClient.get<Trip[]>(url);
    },

    // Get trip by ID
    getById: async (tripId: number): Promise<Trip> => {
        return apiClient.get<Trip>(`/v1/trips/${tripId}`);
    },

    // Get trips by driver
    getByDriver: async (driverId: number): Promise<Trip[]> => {
        return apiClient.get<Trip[]>('/v1/trips');
    },

    // Get trips by vehicle
    getByVehicle: async (vehicleId: number): Promise<Trip[]> => {
        return apiClient.get<Trip[]>('/v1/trips');
    },

    // Get trips by status
    getByStatus: async (status: TripStatus): Promise<Trip[]> => {
        return apiClient.get<Trip[]>('/v1/trips');
    },

    // Create trip
    create: async (trip: TripCreate): Promise<Trip> => {
        return apiClient.post<Trip>('/v1/trips', trip);
    },

    // Update trip
    update: async (tripId: number, trip: TripUpdate): Promise<Trip> => {
        return apiClient.put<Trip>(`/v1/trips/${tripId}`, trip);
    },

    // Start trip
    start: async (tripId: number): Promise<Trip> => {
        return apiClient.put<Trip>(`/v1/trips/${tripId}`, { status: 'IN_PROGRESS' });
    },

    // Complete trip
    complete: async (tripId: number, actualDistance: number): Promise<Trip> => {
        return apiClient.put<Trip>(`/v1/trips/${tripId}`, {
            status: 'COMPLETED',
            actualDistance,
            arrivalDatetime: new Date().toISOString()
        });
    },

    // Cancel trip
    cancel: async (tripId: number): Promise<Trip> => {
        return apiClient.put<Trip>(`/v1/trips/${tripId}`, { status: 'CANCELLED' });
    },

    // Delete trip
    delete: async (tripId: number): Promise<void> => {
        return apiClient.delete(`/v1/trips/${tripId}`);
    },
};

export default tripApi;

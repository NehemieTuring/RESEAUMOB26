/**
 * FleetMan Mobile - Trip API Service
 * Connected to Spring Boot Backend
 */

import { apiClient } from './client';
import type { OrganizationTrip } from '../services/orgResourcesApi';

export type TripStatus =
    | 'SCHEDULED'
    | 'DEPARTED'
    | 'RETURNING'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'PLANNED'
    | 'IN_PROGRESS';

export interface Trip {
    id: string;
    tripCode: string;
    vehicleId: string;
    driverId: string;
    fleetId: string;
    status: string;
    startDate: string;
    startTime: string;
    departureLocation?: string;
    returnLocation?: string;
    endDate?: string;
    endTime?: string;
    missionObject?: string;
    missionCost?: number;
    driverFullName?: string;
    vehicleRegistration?: string;
    distanceKm?: number;
    cancelReason?: string;
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

const asArray = <T>(raw: T[] | T | null | undefined): T[] => {
    if (Array.isArray(raw)) return raw;
    if (raw == null) return [];
    return [raw];
};

const tripDistance = (trip: OrganizationTrip): number | undefined => {
    const computed = Number(trip.computedDistanceKm ?? 0);
    if (Number.isFinite(computed) && computed > 0) return computed;
    const raw = Number(trip.distanceKm ?? 0);
    return Number.isFinite(raw) && raw > 0 ? raw : undefined;
};

export const toAppTrip = (trip: OrganizationTrip): Trip => ({
    id: trip.id,
    tripCode: trip.tripCode ?? '',
    vehicleId: trip.vehicleId ?? '',
    driverId: trip.driverId ?? '',
    fleetId: trip.fleetId ?? '',
    status: trip.status ?? '',
    startDate: trip.startDate ?? '',
    startTime: trip.startTime ?? '',
    departureLocation: trip.departureLocation ?? undefined,
    returnLocation: trip.returnLocation ?? undefined,
    endDate: trip.endDate ?? undefined,
    endTime: trip.endTime ?? undefined,
    missionObject: trip.missionObject ?? undefined,
    driverFullName: trip.driverFullName ?? undefined,
    vehicleRegistration: trip.vehicleRegistration ?? undefined,
    distanceKm: tripDistance(trip),
    cancelReason: trip.cancelReason ?? undefined,
});

export const tripStatusLabel = (status?: string | null): string => {
    switch ((status || '').toUpperCase()) {
        case 'SCHEDULED':
        case 'PLANNED':
            return 'Planifié';
        case 'DEPARTED':
            return 'En route';
        case 'RETURNING':
        case 'IN_PROGRESS':
            return 'En cours';
        case 'COMPLETED':
            return 'Terminé';
        case 'CANCELLED':
            return 'Annulé';
        default:
            return status || '-';
    }
};

export const isScheduledTrip = (status?: string | null): boolean => {
    const value = (status || '').toUpperCase();
    return value === 'SCHEDULED' || value === 'PLANNED';
};

export const TripService = {
    getAll: async (_fleetId?: string): Promise<Trip[]> => {
        const list = asArray(await apiClient.get<OrganizationTrip[]>('/v1/organization/trips'));
        return list.map(toAppTrip);
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

    // Get active trip for specific driver ID
    getActiveForDriver: async (driverId: string): Promise<Trip[]> => {
        return apiClient.get<Trip[]>(`/v1/trips/driver/${driverId}/active`);
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
        return apiClient.post<Trip>(`/v1/trips/${tripId}/start`, { });
    },

    // Complete trip
    complete: async (tripId: string): Promise<Trip> => {
        return apiClient.put<Trip>(`/v1/trips/${tripId}/complete`, { });
    },

    // Cancel trip
    cancel: async (tripId: string, reason?: string): Promise<Trip> => {
        return apiClient.patch<Trip>(`/v1/trips/${tripId}/cancel`, { reason });
    },

    // Delete trip
    delete: async (tripId: string): Promise<void> => {
        return apiClient.delete(`/v1/trips/${tripId}`);
    },
};

export default TripService;

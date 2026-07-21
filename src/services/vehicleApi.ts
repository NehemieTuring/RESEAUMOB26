/**
 * FleetMan Mobile - Vehicle API Service
 * Connecte a FleetMan-Backend-Monolithe : /api/v1/vehicles
 *
 * Backend : { id, licensePlate, brand, model, status, fuelType, fleetId, ... }
 * L'app manipule historiquement { vehicleId, vehicleMake, vehicleRegistrationNumber, ... }
 * => adaptateurs ci-dessous.
 */

import apiClient from './api';

export interface BackendVehicle {
    id: string;
    fleetId: string | null;
    managerId: string | null;
    currentDriverId: string | null;
    vehicleTypeId: string | null;
    licensePlate: string;
    vehicleSerialNumber: string | null;
    brand: string | null;
    model: string | null;
    manufacturingYear: number | null;
    transmissionType: string | null;
    fuelType: string | null;
    tankCapacity: number | null;
    totalSeatNumber: number | null;
    averageFuelConsumption: number | null;
    color: string | null;
    status: string;
    photoUrl: string | null;
    operationalParameters?: {
        currentSpeed: number | null;
        fuelLevel: string | null;
        mileage: number | null;
        latitude: number | null;
        longitude: number | null;
    } | null;
}

/** Modele utilise par les ecrans de l'app. */
export interface Vehicle {
    vehicleId: string;
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
    fleetId: string | null;
    photoUrl?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface VehicleCreate {
    vehicleMake: string;
    vehicleModel: string;
    vehicleRegistrationNumber: string;
    type?: string;
    vehicleIdentificationNumber?: string;
    numberOfPassengers?: number;
    state?: string;
    fuelType?: string;
    fleetId?: string;
    manufacturingYear?: number;
    color?: string;
    // Champs UI non transmis tels quels au backend.
    fuelLevel?: number;
    speed?: number;
    vehicleDocument?: string;
    vehicleDeviceIdAddress?: string;
}

export interface VehicleUpdate extends Partial<VehicleCreate> {}

export interface VehicleGlobalStats {
    totalVehicles: number;
    inService: number;
    outOfService: number;
    parked: number;
    underMaintenance: number;
    inAlarm: number;
}

const toApp = (v: BackendVehicle): Vehicle => ({
    vehicleId: v.id,
    vehicleMake: v.brand ?? '',
    vehicleModel: v.model ?? '',
    vehicleRegistrationNumber: v.licensePlate,
    type: v.vehicleTypeId ?? '',
    vehicleIdentificationNumber: v.vehicleSerialNumber ?? '',
    vehicleDocument: '',
    vehicleDeviceIdAddress: '',
    fuelLevel: Number(v.operationalParameters?.fuelLevel ?? 0) || 0,
    numberOfPassengers: v.totalSeatNumber ?? 0,
    speed: v.operationalParameters?.currentSpeed ?? 0,
    state: v.status,
    fuelType: v.fuelType ?? '',
    fleetId: v.fleetId,
    photoUrl: v.photoUrl,
});

const toBackend = (v: VehicleCreate | VehicleUpdate) => ({
    licensePlate: v.vehicleRegistrationNumber,
    brand: v.vehicleMake,
    model: v.vehicleModel,
    fleetId: v.fleetId,
    fuelType: v.fuelType,
    totalSeatNumber: v.numberOfPassengers,
    vehicleSerialNumber: v.vehicleIdentificationNumber,
    manufacturingYear: v.manufacturingYear,
    color: v.color,
    vehicleTypeId: v.type || undefined,
});

export const vehicleApi = {
    /** Tous les vehicules visibles par l'utilisateur connecte. */
    getAll: async (): Promise<Vehicle[]> => {
        const list = await apiClient.get<BackendVehicle[]>('/v1/vehicles');
        return (list ?? []).map(toApp);
    },

    getById: async (vehicleId: string): Promise<Vehicle> => {
        return toApp(await apiClient.get<BackendVehicle>(`/v1/vehicles/${vehicleId}`));
    },

    /** Vehicules d'une flotte donnee. */
    getByFleetId: async (fleetId: string): Promise<Vehicle[]> => {
        const list = await apiClient.get<BackendVehicle[]>(`/v1/fleets/${fleetId}/vehicles`);
        return (list ?? []).map(toApp);
    },

    /** Cree un vehicule (bouton "Nouveau vehicule"). */
    create: async (vehicle: VehicleCreate): Promise<Vehicle> => {
        return toApp(await apiClient.post<BackendVehicle>('/v1/vehicles', toBackend(vehicle)));
    },

    /** Mise a jour partielle (le backend expose PATCH). */
    update: async (vehicleId: string, vehicle: VehicleUpdate): Promise<Vehicle> => {
        return toApp(await apiClient.patch<BackendVehicle>(`/v1/vehicles/${vehicleId}`, toBackend(vehicle)));
    },

    delete: async (vehicleId: string): Promise<void> => {
        return apiClient.delete(`/v1/vehicles/${vehicleId}`);
    },

    /** Parametres operationnels (position, vitesse, carburant). */
    getOperational: async (vehicleId: string): Promise<any> => {
        return apiClient.get<any>(`/v1/vehicles/${vehicleId}/operational`);
    },

    updateOperational: async (vehicleId: string, data: Record<string, any>): Promise<any> => {
        return apiClient.patch(`/v1/vehicles/${vehicleId}/operational`, data);
    },

    updateFinancial: async (vehicleId: string, data: Record<string, any>): Promise<any> => {
        return apiClient.put(`/v1/vehicles/${vehicleId}/financial-parameters`, data);
    },

    updateMaintenance: async (vehicleId: string, data: Record<string, any>): Promise<any> => {
        return apiClient.put(`/v1/vehicles/${vehicleId}/maintenance-parameters`, data);
    },

    /** Referentiels (marques, modeles, carburants...). */
    getLookup: async (resource: string): Promise<any[]> => {
        return apiClient.get<any[]>(`/v1/vehicles/lookup/${resource}`);
    },

    getAllResources: async (): Promise<any> => {
        return apiClient.get<any>('/v1/vehicles/resources/all');
    },

    /** Galerie photo du vehicule. */
    getMedia: async (vehicleId: string): Promise<any[]> => {
        return apiClient.get<any[]>(`/v1/vehicles/${vehicleId}/media`);
    },

    deleteMedia: async (vehicleId: string, imageId: string): Promise<void> => {
        return apiClient.delete(`/v1/vehicles/${vehicleId}/media/${imageId}`);
    },

    /** Statistiques globales calculees cote client (pas d'endpoint dedie). */
    getGlobalStats: async (): Promise<VehicleGlobalStats> => {
        const list = await vehicleApi.getAll();
        const count = (s: string) => list.filter((v) => v.state === s).length;
        return {
            totalVehicles: list.length,
            inService: count('ON_TRIP'),
            outOfService: count('OUT_OF_SERVICE'),
            parked: count('AVAILABLE'),
            underMaintenance: count('MAINTENANCE'),
            inAlarm: 0,
        };
    },
};

export default vehicleApi;

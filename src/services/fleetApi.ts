/**
 * FleetMan Mobile - Fleet API Service
 * Connecte a FleetMan-Backend-Monolithe : /api/v1/fleets
 *
 * Le backend expose { id, managerId, name, phoneNumber, createdAt, vehicleCount }.
 * On conserve l'interface historique de l'app via des adaptateurs.
 */

import apiClient from './api';

/** DTO renvoye par le backend. */
export interface BackendFleet {
    id: string;
    managerId: string;
    name: string;
    phoneNumber: string | null;
    createdAt: string | null;
    vehicleCount: number | null;
}

/** Modele utilise par les ecrans de l'app. */
export interface Fleet {
    fleetId: string;
    fleetName: string;
    fleetDescription: string;
    fleetType: string;
    fleetManagerId?: string;
    fleetManagerName?: string;
    vehiclesCount: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface FleetCreate {
    fleetName: string;
    fleetDescription?: string;
    fleetType?: string;
    /** Le backend stocke un numero de telephone au niveau de la flotte. */
    phoneNumber?: string;
}

export interface FleetUpdate {
    fleetName?: string;
    fleetDescription?: string;
    fleetType?: string;
    phoneNumber?: string;
}

const toApp = (f: BackendFleet): Fleet => ({
    fleetId: f.id,
    fleetName: f.name,
    fleetDescription: '',
    fleetType: '',
    fleetManagerId: f.managerId,
    vehiclesCount: f.vehicleCount ?? 0,
    isActive: true,
    createdAt: f.createdAt ?? undefined,
});

const toBackend = (f: FleetCreate | FleetUpdate) => ({
    name: (f as FleetCreate).fleetName,
    phoneNumber: f.phoneNumber,
});

export const fleetApi = {
    /** Toutes les flottes du gestionnaire connecte. */
    getAll: async (): Promise<Fleet[]> => {
        const list = await apiClient.get<BackendFleet[]>('/v1/fleets');
        return (list ?? []).map(toApp);
    },

    getById: async (fleetId: string): Promise<Fleet> => {
        return toApp(await apiClient.get<BackendFleet>(`/v1/fleets/${fleetId}`));
    },

    /** Cree une flotte (bouton "Nouvelle flotte"). */
    create: async (fleet: FleetCreate): Promise<Fleet> => {
        return toApp(await apiClient.post<BackendFleet>('/v1/fleets', toBackend(fleet)));
    },

    update: async (fleetId: string, fleet: FleetUpdate): Promise<Fleet> => {
        return toApp(await apiClient.put<BackendFleet>(`/v1/fleets/${fleetId}`, toBackend(fleet)));
    },

    delete: async (fleetId: string): Promise<void> => {
        return apiClient.delete(`/v1/fleets/${fleetId}`);
    },

    /** Statistiques d'une flotte. */
    getStats: async (fleetId: string): Promise<any> => {
        return apiClient.get<any>(`/v1/fleets/${fleetId}/stats`);
    },

    /** Vehicules d'une flotte. */
    getVehicles: async (fleetId: string): Promise<any[]> => {
        return apiClient.get<any[]>(`/v1/fleets/${fleetId}/vehicles`);
    },

    /** Rattache un vehicule existant a la flotte. */
    addVehicle: async (fleetId: string, vehicleId: string): Promise<void> => {
        return apiClient.post(`/v1/fleets/${fleetId}/vehicles`, { vehicleId });
    },

    removeVehicle: async (fleetId: string, vehicleId: string): Promise<void> => {
        return apiClient.delete(`/v1/fleets/${fleetId}/vehicles/${vehicleId}`);
    },

    /** Conducteurs d'une flotte. */
    getDrivers: async (fleetId: string): Promise<any[]> => {
        return apiClient.get<any[]>(`/v1/fleets/${fleetId}/drivers`);
    },

    /** Rattache un conducteur existant (par email ou username). */
    addDriver: async (fleetId: string, identifier: string): Promise<void> => {
        return apiClient.post(`/v1/fleets/${fleetId}/drivers`, { identifier });
    },

    removeDriver: async (fleetId: string, driverId: string): Promise<void> => {
        return apiClient.delete(`/v1/fleets/${fleetId}/drivers/${driverId}`);
    },

    /** Compte les flottes (le backend n'expose pas de /count dedie). */
    count: async (): Promise<number> => {
        const list = await apiClient.get<BackendFleet[]>('/v1/fleets');
        return (list ?? []).length;
    },
};

export default fleetApi;

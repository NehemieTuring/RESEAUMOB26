/**
 * FleetMan Mobile - Fleet API Service
 * Connecte a FleetMan-Backend-Monolithe : /api/v1/fleets
 *
 * Le backend expose { id, managerId, name, phoneNumber, createdAt, vehicleCount }.
 * On conserve l'interface historique de l'app via des adaptateurs.
 */

import apiClient from './api';
import { isAdminSession } from '../api/session';

/** DTO renvoye par le backend (FleetResponse). */
export interface BackendFleet {
    id: string;
    name: string;
    phoneNumber: string | null;
    monthlyBudget?: number | null;
    creationDate?: string | null;
    managerUserId?: string | null;
    /** Alias historique. */
    managerId?: string | null;
    createdAt?: string | null;
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
    fleetManagerId: f.managerUserId ?? f.managerId ?? undefined,
    vehiclesCount: f.vehicleCount ?? 0,
    isActive: true,
    createdAt: f.creationDate ?? f.createdAt ?? undefined,
});

const fleetsPath = async (): Promise<string> =>
    (await isAdminSession()) ? '/v1/admin/management/fleets' : '/v1/fleets';

const toBackend = (f: FleetCreate | FleetUpdate) => ({
    name: (f as FleetCreate).fleetName,
    phoneNumber: f.phoneNumber,
});

export const fleetApi = {
    /** Toutes les flottes visibles (manager : les siennes ; admin : toutes). */
    getAll: async (): Promise<Fleet[]> => {
        const list = await apiClient.get<BackendFleet[]>(await fleetsPath());
        return (list ?? []).map(toApp);
    },

    getById: async (fleetId: string): Promise<Fleet> => {
        const base = await fleetsPath();
        return toApp(await apiClient.get<BackendFleet>(`${base}/${fleetId}`));
    },

    /** Cree une flotte (bouton "Nouvelle flotte") — endpoint admin. */
    create: async (fleet: FleetCreate): Promise<Fleet> => {
        return toApp(await apiClient.post<BackendFleet>('/v1/admin/management/fleets', toBackend(fleet)));
    },

    update: async (fleetId: string, fleet: FleetUpdate): Promise<Fleet> => {
        const base = await fleetsPath();
        return toApp(await apiClient.put<BackendFleet>(`${base}/${fleetId}`, toBackend(fleet)));
    },

    delete: async (fleetId: string): Promise<void> => {
        const base = await fleetsPath();
        return apiClient.delete(`${base}/${fleetId}`);
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
        const list = await apiClient.get<BackendFleet[]>(await fleetsPath());
        return (list ?? []).length;
    },
};

export default fleetApi;

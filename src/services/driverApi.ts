/**
 * FleetMan Mobile - Driver API Service
 * Connecte a FleetMan-Backend-Monolithe : /api/v1/drivers
 *
 * Backend : { userId, fleetId, licenceNumber, status, assignedVehicleId,
 *             firstName, lastName, email, phone, photoUrl }
 * L'app manipule historiquement { driverId, driverFirstName, ... } => adaptateurs.
 *
 * La CREATION d'un conducteur passe par /v1/fleets/{fleetId}/drivers/register
 * (elle cree a la fois le compte utilisateur et la fiche conducteur).
 */

import apiClient from './api';

export interface BackendDriver {
    userId: string;
    fleetId: string | null;
    licenceNumber: string;
    status: string;
    assignedVehicleId: string | null;
    photoUrl: string | null;
    username?: string | null;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    isActive?: boolean;
    lastLoginAt?: string | null;
}

/** Modele utilise par les ecrans de l'app. */
export interface Driver {
    driverId: string;
    driverFirstName: string;
    driverLastName: string;
    driverEmail: string;
    driverPhoneNumber: string;
    driverLicenseNumber?: string;
    driverLicenseExpiryDate?: string;
    driverStatus?: string;
    fleetId?: string | null;
    assignedVehicleId?: string | null;
    photoUrl?: string | null;
    createdAt?: string;
    updatedAt?: string;
    // Champs saisis dans l'UI mais non persistes par le backend actuel.
    driverCardNumber?: string;
    driverEmergencyContactName?: string;
    driverEmergencyContactPhone?: string;
    driverPersonalInformation?: string;
    driverAddress?: string;
    driverDateOfBirth?: string;
    /** Alias historique de driverLicenseExpiryDate. */
    driverLicenseExpiry?: string;
}

export interface DriverCreate {
    driverFirstName: string;
    driverLastName: string;
    driverEmail: string;
    driverPassword: string;
    driverPhoneNumber: string;
    driverLicenseNumber: string;
    /** Flotte de rattachement (optionnelle). */
    fleetId?: string;
    username?: string;
}

export interface DriverUpdate {
    driverFirstName?: string;
    driverLastName?: string;
    driverEmail?: string;
    driverPhoneNumber?: string;
    driverLicenseNumber?: string;
    driverStatus?: string;
    fleetId?: string;
    // Champs UI non persistes par le backend actuel.
    driverCardNumber?: string;
    driverEmergencyContactName?: string;
    driverEmergencyContactPhone?: string;
    driverPersonalInformation?: string;
    driverLicenseExpiryDate?: string;
}

const toApp = (d: BackendDriver): Driver => ({
    driverId: d.userId,
    driverFirstName: d.firstName ?? '',
    driverLastName: d.lastName ?? '',
    driverEmail: d.email ?? '',
    driverPhoneNumber: d.phone ?? '',
    driverLicenseNumber: d.licenceNumber,
    driverStatus: d.status,
    fleetId: d.fleetId,
    assignedVehicleId: d.assignedVehicleId,
    photoUrl: d.photoUrl,
});

export const driverApi = {
    /** Liste des conducteurs (filtrable par flotte / assignation). */
    getAll: async (fleetId?: string, isAssigned?: boolean): Promise<Driver[]> => {
        const params: string[] = [];
        if (fleetId) params.push(`fleetId=${encodeURIComponent(fleetId)}`);
        if (isAssigned !== undefined) params.push(`isAssigned=${isAssigned}`);
        const qs = params.length ? `?${params.join('&')}` : '';
        const list = await apiClient.get<BackendDriver[]>(`/v1/drivers${qs}`);
        return (list ?? []).map(toApp);
    },

    getById: async (driverId: string): Promise<Driver> => {
        return toApp(await apiClient.get<BackendDriver>(`/v1/drivers/${driverId}`));
    },

    /** Recherche par email ou nom d'utilisateur. */
    search: async (identifier: string): Promise<Driver> => {
        return toApp(
            await apiClient.get<BackendDriver>(`/v1/drivers/search?identifier=${encodeURIComponent(identifier)}`)
        );
    },

    /**
     * Cree un conducteur (bouton "Nouveau conducteur").
     * Cree le compte utilisateur ET la fiche conducteur, potentiellement sans flotte.
     */
    create: async (driver: DriverCreate): Promise<Driver> => {
        const body = {
            username:
                driver.username ||
                `${driver.driverFirstName}.${driver.driverLastName}`.toLowerCase().replace(/\s+/g, ''),
            email: driver.driverEmail,
            password: driver.driverPassword,
            phone: driver.driverPhoneNumber,
            firstName: driver.driverFirstName,
            lastName: driver.driverLastName,
            licenceNumber: driver.driverLicenseNumber,
        };
        const endpoint = driver.fleetId 
            ? `/v1/fleets/${driver.fleetId}/drivers/register` 
            : `/v1/drivers/register`;
        return toApp(
            await apiClient.post<BackendDriver>(endpoint, body)
        );
    },

    update: async (driverId: string, driver: DriverUpdate): Promise<Driver> => {
        const body = {
            firstName: driver.driverFirstName,
            lastName: driver.driverLastName,
            email: driver.driverEmail,
            phone: driver.driverPhoneNumber,
            licenceNumber: driver.driverLicenseNumber,
            status: driver.driverStatus,
            fleetId: driver.fleetId,
        };
        return toApp(await apiClient.put<BackendDriver>(`/v1/drivers/${driverId}`, body));
    },

    /** Retire le conducteur de sa flotte (le backend n'a pas de suppression directe). */
    removeFromFleet: async (fleetId: string, driverId: string): Promise<void> => {
        return apiClient.delete(`/v1/fleets/${fleetId}/drivers/${driverId}`);
    },

    /**
     * Alias retrocompatible : le backend ne supprime pas un conducteur,
     * il le detache de sa flotte. On resout la flotte depuis sa fiche.
     */
    delete: async (driverId: string): Promise<void> => {
        const d = await apiClient.get<BackendDriver>(`/v1/drivers/${driverId}`);
        if (!d?.fleetId) {
            throw new Error("Ce conducteur n'est rattache a aucune flotte.");
        }
        return apiClient.delete(`/v1/fleets/${d.fleetId}/drivers/${driverId}`);
    },

    /** Assigne un vehicule au conducteur. */
    assignVehicle: async (driverId: string, vehicleId: string): Promise<void> => {
        return apiClient.post(`/v1/drivers/${driverId}/assign-vehicle`, { vehicleId });
    },

    unassignVehicle: async (driverId: string, vehicleId?: string): Promise<void> => {
        const qs = vehicleId ? `?vehicleId=${encodeURIComponent(vehicleId)}` : '';
        return apiClient.post(`/v1/drivers/${driverId}/unassign-vehicle${qs}`);
    },

    /** Change le statut (ACTIVE / INACTIVE). */
    updateStatus: async (driverId: string, status: string): Promise<Driver> => {
        return toApp(await apiClient.put<BackendDriver>(`/v1/drivers/${driverId}`, { status }));
    },
};

export default driverApi;

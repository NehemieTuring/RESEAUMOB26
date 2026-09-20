/**
 * Ressources d'une organisation (admin = org).
 * GET /api/v1/organization/*
 */

import { apiClient } from '../api/client';
import type { BackendDriver, Driver } from '../api/driverService';
import type { Vehicle } from '../api/vehicleService';
import type { BackendFleet, Fleet } from './fleetApi';
import type { FleetManager } from './fleetManagerApi';
import type { Incident } from './incidentApi';
import type { FuelRecharge } from './fuelRechargeApi';
import type { Maintenance } from './maintenanceApi';
import { Gender, Language } from '../types';

export interface OrganizationSummary {
    adminId: string;
    managerCount: number;
    fleetCount: number;
    vehicleCount: number;
    availableVehicleCount: number;
    driverCount: number;
    tripCount: number;
    incidentCount: number;
    zoneCount: number;
}

export interface OrganizationKpis {
    counts: OrganizationSummary;
    completedTrips: number;
    openIncidents: number;
    totalFuelCost?: number | string | null;
    totalFuelLiters?: number | string | null;
    fuelRechargeCount?: number;
    totalMaintenanceCost?: number | string | null;
    maintenanceCount?: number;
    totalDistanceKm?: number | string | null;
    availableVehicles?: number;
    onTripVehicles?: number;
    maintenanceVehicles?: number;
}

export interface OrganizationProfile {
    adminId: string;
    organizationName: string | null;
    logoUrl: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    photoUrl: string | null;
    managerCount: number;
    fleetCount: number;
    vehicleCount: number;
    driverCount: number;
}

interface OrgVehicle {
    id: string;
    fleetId: string | null;
    managerId: string | null;
    currentDriverId?: string | null;
    vehicleTypeId?: string | null;
    vehicleTypeLabel?: string | null;
    licensePlate: string;
    brand: string | null;
    model: string | null;
    manufacturingYear?: number | null;
    color?: string | null;
    status: string;
    photoUrl: string | null;
    geofenceRemoteId?: string | null;
    fuelLevel?: string | number | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

const parseFuelLevel = (raw: string | number | null | undefined): number => {
    if (raw == null || raw === '') return 0;
    if (typeof raw === 'number') return raw;
    const n = parseFloat(String(raw).replace('%', '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
};

const asArray = <T>(raw: T[] | T | null | undefined): T[] => {
    if (Array.isArray(raw)) return raw;
    if (raw == null) return [];
    return [raw];
};

const toAppVehicle = (v: OrgVehicle): Vehicle => ({
    vehicleId: v.id,
    vehicleMake: v.brand ?? '',
    vehicleModel: v.model ?? '',
    vehicleRegistrationNumber: v.licensePlate,
    type: v.vehicleTypeLabel ?? '',
    vehicleIdentificationNumber: '',
    vehicleDocument: '',
    vehicleDeviceIdAddress: v.geofenceRemoteId ?? '',
    fuelLevel: parseFuelLevel(v.fuelLevel),
    numberOfPassengers: 0,
    speed: 0,
    state: v.status,
    fuelType: '',
    fleetId: v.fleetId,
    currentDriverId: v.currentDriverId ?? null,
    photoUrl: v.photoUrl ?? undefined,
    manufacturingYear: v.manufacturingYear ?? null,
    color: v.color ?? null,
    createdAt: v.createdAt ?? undefined,
    updatedAt: v.updatedAt ?? undefined,
});

const toAppDriver = (d: BackendDriver): Driver => ({
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
    username: d.username ?? null,
});

const toAppFleet = (f: BackendFleet): Fleet => ({
    fleetId: f.id,
    fleetName: f.name,
    fleetDescription: '',
    fleetType: '',
    fleetManagerId: f.managerUserId ?? f.managerId ?? undefined,
    vehiclesCount: f.vehicleCount ?? 0,
    createdAt: f.creationDate ?? f.createdAt ?? undefined,
});

interface OrgManager {
    userId?: string;
    id?: string;
    username?: string;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    isActive?: boolean;
    createdByAdminId?: string;
    organizationId?: string;
}

const toAppManager = (m: OrgManager): FleetManager => ({
    managerId: m.userId || m.id || '',
    managerFirstName: m.firstName || '',
    managerLastName: m.lastName || '',
    managerEmail: m.email || '',
    managerPhoneNumber: m.phone || '',
    managerIdCardNumber: '',
    personalAddress: '',
    personalCity: '',
    personalPostalCode: '',
    personalCountry: '',
    taxNumber: '',
    gender: Gender.MALE,
    niu: '',
    language: Language.FR,
    managerState: m.isActive ? 'ACTIVE' : 'INACTIVE',
    adminId: m.createdByAdminId || m.organizationId || '',
    adminName: m.companyName || '',
    createdAt: '',
    lastLogin: '',
    isActive: !!m.isActive,
    fleetsCount: 0,
    numberOfFleets: 0,
    numberOfMembers: 0,
    managerAddress: '',
});

const toAppIncident = (i: {
    id: string;
    type?: string | null;
    description?: string | null;
    severity?: string | null;
    status?: string | null;
    incidentDateTime?: string | null;
    cost?: number | string | null;
    vehicleId?: string | null;
    driverId?: string | null;
    driverFullName?: string | null;
    vehicleRegistration?: string | null;
    longitude?: number | null;
    latitude?: number | null;
    reportedBy?: string | null;
}): Incident => ({
    id: i.id,
    type: i.type ?? '',
    description: i.description ?? '',
    severity: i.severity ?? '',
    status: i.status ?? '',
    incidentDateTime: i.incidentDateTime ?? '',
    cost: Number(i.cost ?? 0),
    vehicleId: i.vehicleId ?? '',
    managerId: '',
    vehicleRegistration: i.vehicleRegistration ?? '',
    driverId: i.driverId ?? '',
    driverFullName: i.driverFullName ?? '',
    reportedBy: i.reportedBy ?? '',
    longitude: i.longitude ?? 0,
    latitude: i.latitude ?? 0,
    deleted: false,
    createdAt: i.incidentDateTime ?? '',
});

const num = (raw: number | string | null | undefined): number => {
    const n = Number(raw ?? 0);
    return Number.isFinite(n) ? n : 0;
};

const toAppFuelRecharge = (r: {
    id: string;
    quantity?: number | string | null;
    price?: number | string | null;
    rechargeDateTime?: string | null;
    stationName?: string | null;
    vehicleId?: string | null;
    vehicleRegistration?: string | null;
    driverId?: string | null;
    driverFullName?: string | null;
}): FuelRecharge => ({
    rechargeId: r.id as unknown as number,
    rechargeQuantity: num(r.quantity),
    rechargePrice: num(r.price),
    rechargeDatetime: r.rechargeDateTime ?? '',
    stationName: (r.stationName ?? 'OTHER') as FuelRecharge['stationName'],
    vehicleId: r.vehicleId as unknown as number,
    driverId: r.driverId as unknown as number,
    vehicleRegistration: r.vehicleRegistration ?? undefined,
    driverName: r.driverFullName ?? undefined,
});

const toAppMaintenance = (m: {
    id: string;
    subject?: string | null;
    cost?: number | string | null;
    dateTime?: string | null;
    locationName?: string | null;
    vehicleId?: string | null;
    vehicleRegistration?: string | null;
    driverId?: string | null;
    driverFullName?: string | null;
}): Maintenance => ({
    maintenanceId: m.id as unknown as number,
    maintenanceDatetime: m.dateTime ?? '',
    maintenanceLocationName: m.locationName ?? '',
    maintenanceSubject: m.subject ?? '',
    maintenanceCost: num(m.cost),
    maintenanceReport: '',
    vehicleId: m.vehicleId as unknown as number,
    driverId: m.driverId as unknown as number,
    vehicleRegistration: m.vehicleRegistration ?? undefined,
    driverName: m.driverFullName ?? undefined,
});

export interface OrganizationTrip {
    id: string;
    tripCode?: string | null;
    fleetId?: string | null;
    vehicleId?: string | null;
    driverId?: string | null;
    createdBy?: string | null;
    status?: string | null;
    startDate?: string | null;
    startTime?: string | null;
    endDate?: string | null;
    endTime?: string | null;
    departureLocation?: string | null;
    returnLocation?: string | null;
    missionObject?: string | null;
    distanceKm?: number | string | null;
    computedDistanceKm?: number | string | null;
    vehicleRegistration?: string | null;
    driverFullName?: string | null;
    cancelReason?: string | null;
}

export const orgResourcesApi = {
    getSummary: () => apiClient.get<OrganizationSummary>('/v1/organization/summary'),

    getKpis: () => apiClient.get<OrganizationKpis>('/v1/organization/kpis'),

    getProfile: () => apiClient.get<OrganizationProfile>('/v1/organization/profile'),

    updateProfile: (data: { organizationName?: string; logoUrl?: string }) =>
        apiClient.put<OrganizationProfile>('/v1/organization/profile', data),

    uploadLogo: (fileUri: string, mimeType: string, fileName: string) =>
        apiClient.uploadFile<OrganizationProfile>('/v1/organization/logo', fileUri, mimeType, fileName),

    getVehicles: async (): Promise<Vehicle[]> => {
        const list = asArray(await apiClient.get<OrgVehicle[]>('/v1/organization/vehicles'));
        return list.map(toAppVehicle);
    },

    getRecentVehicles: async (limit = 3): Promise<Vehicle[]> => {
        const list = asArray(
            await apiClient.get<OrgVehicle[]>(`/v1/organization/vehicles/recent?limit=${limit}`)
        );
        return list.map(toAppVehicle);
    },

    getDrivers: async (): Promise<Driver[]> => {
        const list = asArray(await apiClient.get<BackendDriver[]>('/v1/organization/drivers'));
        return list.map(toAppDriver);
    },

    getFleets: async (): Promise<Fleet[]> => {
        const list = asArray(await apiClient.get<BackendFleet[]>('/v1/organization/fleets'));
        return list.map(toAppFleet);
    },

    getManagers: async (): Promise<FleetManager[]> => {
        const list = asArray(await apiClient.get<OrgManager[]>('/v1/organization/managers'));
        return list.map(toAppManager);
    },

    getIncidents: async (): Promise<Incident[]> => {
        const list = asArray(await apiClient.get<Parameters<typeof toAppIncident>[0][]>('/v1/organization/incidents'));
        return list.map(toAppIncident);
    },

    getTrips: async (): Promise<OrganizationTrip[]> => {
        return asArray(await apiClient.get<OrganizationTrip[]>('/v1/organization/trips'));
    },

    getFuelRecharges: async (): Promise<FuelRecharge[]> => {
        const list = asArray(await apiClient.get<Parameters<typeof toAppFuelRecharge>[0][]>('/v1/organization/fuel-recharges'));
        return list.map(toAppFuelRecharge);
    },

    getMaintenances: async (): Promise<Maintenance[]> => {
        const list = asArray(await apiClient.get<Parameters<typeof toAppMaintenance>[0][]>('/v1/organization/maintenances'));
        return list.map(toAppMaintenance);
    },
};

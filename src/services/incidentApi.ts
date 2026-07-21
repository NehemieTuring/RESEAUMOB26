/**
 * FleetMan Mobile - Incident API Service
 */

import apiClient from './api';

// Incident types matching backend
export enum IncidentSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

export enum IncidentStatus {
    REPORTED = 'REPORTED',
    UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
    PENDING_INSURANCE = 'PENDING_INSURANCE',
}

export enum IncidentType {
    ACCIDENT = 'ACCIDENT',
    BREAKDOWN = 'BREAKDOWN',
    THEFT = 'THEFT',
    TRAFFIC_VIOLATION = 'TRAFFIC_VIOLATION',
    WEATHER = 'WEATHER',
    OTHER = 'OTHER',
}

export interface Incident {
    incidentId: number;
    incidentType: IncidentType;
    incidentTitle: string;
    incidentDescription: string;
    incidentSeverity: IncidentSeverity;
    incidentStatus: IncidentStatus;
    incidentLocation: string;
    incidentLatitude: number;
    incidentLongitude: number;
    incidentDateTime: string;
    vehicleId: number;
    vehicleName: string;
    driverId: number;
    driverName: string;
    reportedById: number;
    reportedByName: string;
    createdAt: string;
    updatedAt: string;
}

export interface IncidentCreate {
    incidentType: IncidentType;
    incidentTitle: string;
    incidentDescription?: string;
    incidentSeverity: IncidentSeverity;
    incidentLocation?: string;
    incidentLatitude?: number;
    incidentLongitude?: number;
    vehicleId: number;
    driverId?: number;
    reportedById: number;
}

export interface IncidentUpdate {
    incidentTitle?: string;
    incidentDescription?: string;
    incidentSeverity?: IncidentSeverity;
    incidentStatus?: IncidentStatus;
    incidentLocation?: string;
}

export const incidentApi = {
    // Get all incidents (or filtered by adminId)
    getAll: async (adminId?: number): Promise<Incident[]> => {
        const url = adminId ? '/v1/operations/incidents' : '/v1/operations/incidents';
        return apiClient.get<Incident[]>(url);
    },

    // Get incident by ID
    getById: async (incidentId: number): Promise<Incident> => {
        return apiClient.get<Incident>(`/v1/operations/incidents/${incidentId}`);
    },

    // Get incidents by vehicle ID
    getByVehicleId: async (vehicleId: number): Promise<Incident[]> => {
        return apiClient.get<Incident[]>(`/v1/operations/incidents/vehicle/${vehicleId}`);
    },

    // Get incidents by driver ID
    getByDriverId: async (driverId: number): Promise<Incident[]> => {
        return apiClient.get<Incident[]>(`/v1/operations/incidents/driver/${driverId}`);
    },

    // Get incidents by status
    getByStatus: async (status: IncidentStatus): Promise<Incident[]> => {
        return apiClient.get<Incident[]>(`/v1/operations/incidents/filter?status=${status}`);
    },

    // Get incidents by severity
    getBySeverity: async (severity: IncidentSeverity): Promise<Incident[]> => {
        return apiClient.get<Incident[]>(`/v1/operations/incidents/filter?severity=${severity}`);
    },

    // Create incident
    create: async (incident: IncidentCreate): Promise<Incident> => {
        return apiClient.post<Incident>('/v1/operations/incidents', incident);
    },

    // Update incident
    update: async (incidentId: number, incident: IncidentUpdate): Promise<Incident> => {
        return apiClient.put<Incident>(`/v1/operations/incidents/${incidentId}`, incident);
    },

    // Update incident status
    updateStatus: async (incidentId: string, status: IncidentStatus): Promise<Incident> => {
        // Le backend attend PATCH /{id}/status avec le statut dans le corps.
        return apiClient.patch<Incident>(`/v1/operations/incidents/${incidentId}/status`, { status });
    },

    // Delete incident
    delete: async (incidentId: number): Promise<void> => {
        return apiClient.delete(`/v1/operations/incidents/${incidentId}`);
    },
};

export default incidentApi;

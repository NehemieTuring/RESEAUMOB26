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
    id: string;
    type: string;
    description: string;
    severity: string;
    status: string;
    incidentDateTime: string;
    cost: number;
    vehicleId: string;
    managerId: string;
    vehicleRegistration: string;
    driverId: string;
    driverFullName: string;
    reportedBy: string;
    longitude: number;
    latitude: number;
    deleted: boolean;
    createdAt: string;
}

export interface IncidentCreate {
    type: IncidentType | string;
    description?: string;
    severity: IncidentSeverity | string;
    status?: string;
    longitude?: number;
    latitude?: number;
    vehicleId: string;
    driverId?: string;
}

export interface IncidentUpdate {
    type?: string;
    description?: string;
    severity?: string;
    status?: string;
    cost?: number;
}

export const incidentApi = {
    // Get all incidents (or filtered by adminId)
    getAll: async (adminId?: string): Promise<Incident[]> => {
        const url = adminId ? '/v1/operations/incidents' : '/v1/operations/incidents';
        return apiClient.get<Incident[]>(url);
    },

    // Get incident by ID
    getById: async (incidentId: string): Promise<Incident> => {
        return apiClient.get<Incident>(`/v1/operations/incidents/${incidentId}`);
    },

    // Get incidents by vehicle ID
    getByVehicleId: async (vehicleId: string): Promise<Incident[]> => {
        return apiClient.get<Incident[]>(`/v1/operations/incidents/vehicle/${vehicleId}`);
    },

    // Get incidents by driver ID
    getByDriverId: async (driverId: string): Promise<Incident[]> => {
        return apiClient.get<Incident[]>(`/v1/operations/incidents/driver/${driverId}`);
    },

    // Get incidents by status
    getByStatus: async (status: IncidentStatus | string): Promise<Incident[]> => {
        return apiClient.get<Incident[]>(`/v1/operations/incidents/filter?status=${status}`);
    },

    // Get incidents by severity
    getBySeverity: async (severity: IncidentSeverity | string): Promise<Incident[]> => {
        return apiClient.get<Incident[]>(`/v1/operations/incidents/filter?severity=${severity}`);
    },

    // Create incident
    create: async (incident: IncidentCreate): Promise<Incident> => {
        return apiClient.post<Incident>('/v1/operations/incidents', incident);
    },

    // Update incident
    update: async (incidentId: string, incident: IncidentUpdate): Promise<Incident> => {
        return apiClient.put<Incident>(`/v1/operations/incidents/${incidentId}`, incident);
    },

    // Update incident status
    updateStatus: async (incidentId: string, status: IncidentStatus | string): Promise<Incident> => {
        // Le backend attend PATCH /{id}/status avec le statut dans le corps.
        return apiClient.patch<Incident>(`/v1/operations/incidents/${incidentId}/status`, { status });
    },

    // Delete incident
    delete: async (incidentId: string): Promise<void> => {
        return apiClient.delete(`/v1/operations/incidents/${incidentId}`);
    },
};

export default incidentApi;

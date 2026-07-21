/**
 * FleetMan Mobile - Geofence API Service
 * Connected to Spring Boot Backend
 */

import apiClient from './api';

export interface Geofence {
    geofenceId: number;
    geofenceName: string;
    geofenceType: 'CIRCLE' | 'POLYGON';
    center?: {
        type: string;
        coordinates: [number, number];
    };
    radius?: number;
    vertices?: {
        type: string;
        coordinates: [number, number][];
    };
    fleetManagerId: number;
}

export interface GeofenceCircleCreate {
    geofenceName: string;
    centerLongitude: number;
    centerLatitude: number;
    radius: number;
    fleetManagerId: number;
    geofenceStatus?: string;
}

export interface GeofencePolygonCreate {
    geofenceName: string;
    vertices: { longitude: number; latitude: number }[];
    fleetManagerId: number;
}

export const geofenceApi = {
    // Get all geofences
    getAll: async (adminId?: number): Promise<Geofence[]> => {
        // Use admin endpoint if adminId is provided
        const url = adminId ? '/v1/geofences/mine' : '/v1/geofences';
        return apiClient.get<Geofence[]>(url);
    },

    // Get geofence by ID
    getById: async (geofenceId: number): Promise<Geofence> => {
        return apiClient.get<Geofence>(`/v1/geofences/${geofenceId}`);
    },

    // Get geofences by fleet manager
    getByFleetManager: async (managerId: number): Promise<Geofence[]> => {
        return apiClient.get<Geofence[]>('/v1/geofences/mine');
    },

    // Get geofence count
    count: async (): Promise<number> => {
        return apiClient.get<number>('/v1/geofences');
    },

    // Create circle geofence
    createCircle: async (geofence: GeofenceCircleCreate): Promise<Geofence> => {
        // Convert to GeoJSON Point format expected by backend
        const payload = {
            geofenceName: geofence.geofenceName,
            center: {
                type: "Point",
                coordinates: [geofence.centerLongitude, geofence.centerLatitude]
            },
            radius: geofence.radius,
            fleetManagerId: geofence.fleetManagerId,
            geofenceStatus: geofence.geofenceStatus || "OPERATIONAL_ZONE"
        };
        return apiClient.post<Geofence>('/v1/geofences', payload);
    },

    // Create polygon geofence
    createPolygon: async (geofence: GeofencePolygonCreate): Promise<Geofence> => {
        // Convert vertices to GeoJSON LineString format expected by backend
        // Format: { "type": "LineString", "coordinates": [[lng, lat], [lng, lat], ...] }
        const coordinates = geofence.vertices.map(v => [v.longitude, v.latitude]);

        // Close the polygon by adding the first point at the end if not already closed
        if (coordinates.length > 0) {
            const first = coordinates[0];
            const last = coordinates[coordinates.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) {
                coordinates.push([...first]);
            }
        }

        const payload = {
            geofenceName: geofence.geofenceName,
            vertices: {
                type: "LineString",
                coordinates: coordinates
            },
            fleetManagerId: geofence.fleetManagerId
        };

        return apiClient.post<Geofence>('/v1/geofences', payload);
    },

    // Create circle geofence as Admin (uses admin endpoint)
    createCircleAsAdmin: async (adminId: number, geofence: Omit<GeofenceCircleCreate, 'fleetManagerId'>): Promise<Geofence> => {
        const payload = {
            geofenceName: geofence.geofenceName,
            center: {
                type: "Point",
                coordinates: [geofence.centerLongitude, geofence.centerLatitude]
            },
            radius: geofence.radius,
            geofenceStatus: geofence.geofenceStatus || "OPERATIONAL_ZONE"
        };
        return apiClient.post<Geofence>('/v1/geofences/mine', payload);
    },

    // Create polygon geofence as Admin (uses admin endpoint)
    createPolygonAsAdmin: async (adminId: number, geofence: Omit<GeofencePolygonCreate, 'fleetManagerId'>): Promise<Geofence> => {
        const coordinates = geofence.vertices.map(v => [v.longitude, v.latitude]);
        if (coordinates.length > 0) {
            const first = coordinates[0];
            const last = coordinates[coordinates.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) {
                coordinates.push([...first]);
            }
        }
        const payload = {
            geofenceName: geofence.geofenceName,
            vertices: {
                type: "LineString",
                coordinates: coordinates
            }
        };
        return apiClient.post<Geofence>('/v1/geofences/mine', payload);
    },

    // Update geofence
    update: async (geofenceId: number, geofence: Partial<GeofenceCircleCreate>): Promise<Geofence> => {
        return apiClient.put<Geofence>(`/v1/geofences/${geofenceId}`, geofence);
    },

    // Delete geofence
    delete: async (geofenceId: number): Promise<void> => {
        return apiClient.delete(`/v1/geofences/${geofenceId}`);
    },
};

export default geofenceApi;

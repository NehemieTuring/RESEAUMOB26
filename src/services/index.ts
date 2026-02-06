/**
 * FleetMan Mobile - Services Index
 * Export all API services connected to Spring Boot Backend
 */

// API Client
export { default as apiClient, API_BASE_URL } from './api';

// Authentication & Admin
export { authApi, adminApi, organizationApi } from './authApi';

// Fleet Management
export { vehicleApi } from './vehicleApi';
export { driverApi } from './driverApi';
export { fleetApi } from './fleetApi';
export { fleetManagerApi } from './fleetManagerApi';

// Operations
export { tripApi } from './tripApi';
export { positionApi } from './positionApi';
export { geofenceApi } from './geofenceApi';
export { incidentApi } from './incidentApi';
export { notificationApi } from './notificationApi';
export { fuelRechargeApi } from './fuelRechargeApi';
export { maintenanceApi } from './maintenanceApi';

// Vehicle API Types
export type { Vehicle, VehicleCreate, VehicleUpdate, VehicleGlobalStats } from './vehicleApi';

// Driver API Types
export type { Driver, DriverCreate, DriverUpdate } from './driverApi';

// Fleet API Types
export type { Fleet, FleetCreate, FleetUpdate } from './fleetApi';

// Fleet Manager API Types
export type { FleetManager, FleetManagerCreate, FleetManagerUpdate } from './fleetManagerApi';

// Incident API Types
export type { Incident, IncidentCreate, IncidentUpdate } from './incidentApi';
export { IncidentSeverity, IncidentStatus, IncidentType } from './incidentApi';

// Trip API Types
export type { Trip, TripCreate, TripUpdate, TripStatus } from './tripApi';

// Position API Types
export type { Position, PositionCreate } from './positionApi';

// Geofence API Types
export type { Geofence, GeofenceCircleCreate, GeofencePolygonCreate } from './geofenceApi';

// Notification API Types
export type {
    Notification,
    NotificationCreate,
    NotificationType,
    NotificationState,
    NotificationPriority
} from './notificationApi';

// Fuel Recharge API Types
export type { FuelRecharge, FuelRechargeCreate, StationName } from './fuelRechargeApi';

// Maintenance API Types
export type { Maintenance, MaintenanceCreate } from './maintenanceApi';

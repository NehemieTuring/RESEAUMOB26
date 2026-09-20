export { apiClient, setOnSessionExpired, ApiClient, API_BASE_URL } from './client';
export { default } from './client';
export { persistSession, restoreSession, clearSession, persistTokens, ensureBrowseSession } from './session';
export { AuthService, authApi, primaryRole } from './authService';
export {
    FLEET_ROLES,
    normalizeFleetRole,
    resolveFleetRole,
    isDriver,
    isManager,
    isAdmin,
    isSuperAdmin,
    isPlatformAdmin,
    homeRouteForRole,
    areaForRole,
    type FleetRole,
} from './roles';
export { VehicleService, type Vehicle, type BackendVehicle } from './vehicleService';
export { DriverService, type Driver, type BackendDriver } from './driverService';
export { resolveDriverWorkspace, type DriverWorkspace } from './driverContext';
export { TripService, type Trip, type TripStatus, type TripCreate, type TripUpdate } from './tripService';
export { ApiError } from './errors';

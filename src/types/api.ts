/**
 * DTOs réseau FleetMan (requêtes / réponses API).
 * Les types UI (enums métier, formulaires) restent dans ./index.ts.
 */

export interface BackendUserDetail {
    id: string;
    username: string;
    email: string;
    phone: string | null;
    firstName: string;
    lastName: string;
    roles: string[];
    permissions: string[];
    photoUrl: string | null;
    companyName: string | null;
    licenceNumber: string | null;
    vehicleId: string | null;
    isActive: boolean;
    lastLoginAt: string | null;
    companyPhone: string | null;
    companyAddress: string | null;
    companyCity: string | null;
    companyLogoUrl: string | null;
    organizationId: string | null;
}

export interface BackendAuthResponse {
    accessToken: string;
    refreshToken: string;
    user: BackendUserDetail;
}

export interface DESAuthData {
    accessToken: string;
    refreshToken: string;
    user: BackendUserDetail;
}

export interface DESAuthApiResponse {
    success: boolean;
    message: string;
    data: DESAuthData;
}

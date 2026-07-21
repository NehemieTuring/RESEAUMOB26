/**
 * FleetMan Mobile - Authentication & Admin API Services
 * Connecte au backend FleetMan-Backend-Monolithe (Spring Boot, prefixe /api/v1).
 *
 * Le backend expose un login UNIFIE (/v1/auth/login) base sur un JWT :
 * il n'y a pas d'endpoints separes admin / fleet-manager / driver.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';
import { Admin, LoginRequest, LoginResponse, Organization } from '../types';

const AUTH_TOKEN_KEY = '@fleetman_auth_token';
const REFRESH_TOKEN_KEY = '@fleetman_refresh_token';
const USER_DATA_KEY = '@fleetman_user_data';

/** UserDetail renvoye par le backend. */
export interface BackendUserDetail {
    id: string;
    username: string;
    email: string;
    phone: string | null;
    firstName: string;
    lastName: string;
    service: string | null;
    roles: string[];
    permissions: string[];
    photoUrl: string | null;
    companyName: string | null;
    licenceNumber: string | null;
    vehicleId: string | null;
    isActive: boolean;
    lastLoginAt: string | null;
}

export interface BackendAuthResponse {
    accessToken: string;
    refreshToken: string;
    user: BackendUserDetail;
}

/** Ordre de priorite si l'utilisateur cumule plusieurs roles. */
const ROLE_PRIORITY = ['FLEET_SUPER_ADMIN', 'FLEET_ADMIN', 'FLEET_MANAGER', 'FLEET_DRIVER'];

export const primaryRole = (roles: string[] = []): string =>
    ROLE_PRIORITY.find((r) => roles.includes(r)) ?? (roles[0] ?? '');

/** Traduit un role backend en "userType" attendu par les ecrans existants. */
const toUserType = (role: string): string => {
    switch (role) {
        case 'FLEET_SUPER_ADMIN':
        case 'FLEET_ADMIN':
            return 'ADMIN';
        case 'FLEET_MANAGER':
            return 'FLEET_MANAGER';
        case 'FLEET_DRIVER':
            return 'DRIVER';
        default:
            return '';
    }
};

/** Persiste la session et arme le Bearer token du client HTTP. */
export const persistSession = async (auth: BackendAuthResponse): Promise<void> => {
    apiClient.setToken(auth.accessToken);
    await AsyncStorage.multiSet([
        [AUTH_TOKEN_KEY, auth.accessToken],
        [REFRESH_TOKEN_KEY, auth.refreshToken ?? ''],
        [USER_DATA_KEY, JSON.stringify(auth.user)],
    ]);
};

/** Restaure le token au demarrage de l'app (a appeler dans le layout racine). */
export const restoreSession = async (): Promise<BackendUserDetail | null> => {
    const [token, raw] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(USER_DATA_KEY),
    ]);
    if (!token) return null;
    apiClient.setToken(token);
    try {
        return raw ? (JSON.parse(raw) as BackendUserDetail) : null;
    } catch {
        return null;
    }
};

export const clearSession = async (): Promise<void> => {
    apiClient.setToken(null);
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
};

// ============ AUTH API ============

export const authApi = {
    /** Login unifie : POST /v1/auth/login { identifier, password }. */
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        try {
            const res = await apiClient.post<BackendAuthResponse>('/v1/auth/login', {
                identifier: credentials.email,
                password: credentials.password,
            });

            await persistSession(res);

            const role = primaryRole(res.user.roles);
            return {
                success: true,
                message: 'Connexion reussie',
                userId: 0, // le backend utilise des UUID : voir userUuid
                userUuid: res.user.id,
                email: res.user.email,
                fullName: `${res.user.firstName ?? ''} ${res.user.lastName ?? ''}`.trim(),
                role,
                userType: toUserType(role),
                roles: res.user.roles,
            } as LoginResponse;
        } catch (e: any) {
            return {
                success: false,
                message: e?.message || 'Identifiants incorrects',
                userId: 0,
                email: '',
                fullName: '',
                role: '',
                userType: '',
            } as LoginResponse;
        }
    },

    /** Profil de l'utilisateur connecte. */
    me: async (): Promise<BackendUserDetail> => {
        return apiClient.get<BackendUserDetail>('/v1/auth/me');
    },

    /** Rafraichit le jeton d'acces. */
    refresh: async (refreshToken: string): Promise<BackendAuthResponse> => {
        const res = await apiClient.post<BackendAuthResponse>('/v1/auth/refresh', { refreshToken });
        await persistSession(res);
        return res;
    },

    logout: async (): Promise<void> => clearSession(),

    forgotPassword: async (email: string): Promise<void> => {
        return apiClient.post('/v1/auth/forgot-password', { email });
    },

    resetPassword: async (resetToken: string, newPassword: string): Promise<void> => {
        return apiClient.post('/v1/auth/reset-password', { resetToken, newPassword });
    },

    /** Inscription publique d'un gestionnaire (sans authentification). */
    registerManager: async (registrationData: any): Promise<{ id: string; status: string; message: string }> => {
        return apiClient.post('/v1/public/register-manager', registrationData);
    },

    /** Offres d'abonnement publiques. */
    subscriptionPlans: async (): Promise<any[]> => {
        return apiClient.get<any[]>('/v1/public/subscription-plans');
    },
};

// ============ COMPTE (utilisateur connecte) ============

export const accountApi = {
    updateProfile: async (data: { firstName?: string; lastName?: string; phone?: string }): Promise<BackendUserDetail> => {
        return apiClient.post<BackendUserDetail>('/v1/account/profile', data);
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
        return apiClient.post('/v1/account/password', { currentPassword, newPassword });
    },

    uploadPhoto: async (fileUri: string, mimeType: string, fileName: string): Promise<BackendUserDetail> => {
        return apiClient.uploadFile<BackendUserDetail>('/v1/account/photo', fileUri, mimeType, fileName);
    },

    deleteAccount: async (): Promise<void> => {
        return apiClient.delete('/v1/account');
    },
};

// ============ ADMIN API ============

export const adminApi = {
    /** Liste des gestionnaires (role FLEET_MANAGER). */
    getManagers: async (): Promise<any[]> => {
        return apiClient.get<any[]>('/v1/admin/managers');
    },

    /** Detail d'un utilisateur. */
    getUser: async (userId: string): Promise<any> => {
        return apiClient.get<any>(`/v1/admin/users/${userId}`);
    },

    activateManager: async (userId: string): Promise<void> => {
        return apiClient.post(`/v1/admin/managers/${userId}/activate`);
    },

    deactivateManager: async (userId: string): Promise<void> => {
        return apiClient.post(`/v1/admin/managers/${userId}/deactivate`);
    },

    deleteManager: async (userId: string): Promise<void> => {
        return apiClient.delete(`/v1/admin/managers/${userId}`);
    },

    /** Cree un administrateur. */
    createAdmin: async (data: any): Promise<Admin> => {
        return apiClient.post<Admin>('/v1/admin/admins', data);
    },

    /** Ajoute un role a un utilisateur. */
    addRole: async (userId: string, role: string): Promise<void> => {
        return apiClient.post(`/v1/admin/users/${userId}/roles`, { role });
    },

    /** Statistiques d'administration (remplace les anciens /count). */
    getStats: async (): Promise<any> => {
        return apiClient.get<any>('/v1/admin/stats');
    },

    /** Referentiel des types de vehicule. */
    getVehicleTypes: async (): Promise<any[]> => {
        return apiClient.get<any[]>('/v1/admin/resources/vehicle-types');
    },

    createVehicleType: async (data: { code: string; label: string; description?: string }): Promise<any> => {
        return apiClient.post('/v1/admin/resources/vehicle-types', data);
    },

    deleteVehicleType: async (id: string): Promise<void> => {
        return apiClient.delete(`/v1/admin/resources/vehicle-types/${id}`);
    },
};

// ============ ORGANISATION ============
// Le monolithe n'a pas de notion d'"organisation" separee : le profil societe
// est porte par le gestionnaire de flotte (fleet-managers).

export const organizationApi = {
    /** Profil societe du gestionnaire connecte. */
    updateCompany: async (data: {
        companyName?: string;
        companyPhone?: string;
        companyAddress?: string;
        companyCity?: string;
        companyLogoUrl?: string;
    }): Promise<Organization> => {
        return apiClient.put<Organization>('/v1/fleet-managers/me/company', data);
    },

    /** Liste des gestionnaires de flotte. */
    getAll: async (): Promise<any[]> => {
        return apiClient.get<any[]>('/v1/fleet-managers');
    },

    getById: async (userId: string): Promise<any> => {
        return apiClient.get<any>(`/v1/fleet-managers/${userId}`);
    },
};

export default {
    auth: authApi,
    account: accountApi,
    admin: adminApi,
    organization: organizationApi,
};

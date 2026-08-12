/**
 * FleetMan Mobile - Authentication & Admin API Services
 * Connecte au backend FleetMan-DES-Backend (Spring Boot reactif, port 8081, prefixe /api/v1).
 *
 * IMPORTANT : Le DES-Backend enveloppe toutes ses réponses dans :
 *   { success: boolean, message: string, data: <payload> }
 * La fonction login() déroule ce wrapper pour extraire accessToken + user.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';
import { Admin, LoginRequest, LoginResponse, Organization } from '../types';

const AUTH_TOKEN_KEY = '@fleetman_auth_token';
const REFRESH_TOKEN_KEY = '@fleetman_refresh_token';
const USER_DATA_KEY = '@fleetman_user_data';

/** UserDetail renvoyé par /api/v1/auth/me et /api/v1/auth/login du DES-Backend. */
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
    // Champs absents du DES-Backend (gardés pour compatibilité avec les écrans existants).
    companyPhone: string | null;
    companyAddress: string | null;
    companyCity: string | null;
    companyLogoUrl: string | null;
    organizationId: string | null;
}

/**
 * Réponse brute du DES-Backend pour /v1/auth/login :
 *   { success, message, data: { accessToken, refreshToken, user } }
 */
interface DESAuthData {
    accessToken: string;
    refreshToken: string;
    user: BackendUserDetail;
}

interface DESAuthApiResponse {
    success: boolean;
    message: string;
    data: DESAuthData;
}

/** Interface unifiée utilisée en interne après désenveloppement. */
export interface BackendAuthResponse {
    accessToken: string;
    refreshToken: string;
    user: BackendUserDetail;
}

/** Ordre de priorite si l'utilisateur cumule plusieurs roles. */
const ROLE_PRIORITY = [
    'ROLE_SUPER_ADMIN', 'SUPER_ADMIN', 'FLEET_SUPER_ADMIN', 
    'ROLE_ADMIN', 'ADMIN', 'FLEET_ADMIN', 
    'ROLE_ORGANIZATION_MANAGER', 'ORGANIZATION_MANAGER',
    'ROLE_FLEET_MANAGER', 'FLEET_MANAGER', 
    'ROLE_DRIVER', 'DRIVER', 'FLEET_DRIVER'
];

export const primaryRole = (roles: string[] = []): string => {
    // Nettoyer les rôles (enlever le préfixe ROLE_ si présent pour la comparaison, mais garder l'original si besoin)
    const normalizedRoles = roles.map(r => r.toUpperCase());
    return ROLE_PRIORITY.find((r) => normalizedRoles.includes(r)) ?? (roles[0] ?? '');
};

/** Traduit un role backend en "userType" attendu par les ecrans existants. */
const toUserType = (role: string): string => {
    const r = role.replace('ROLE_', '').toUpperCase();
    if (['SUPER_ADMIN', 'FLEET_SUPER_ADMIN', 'ADMIN', 'FLEET_ADMIN'].includes(r)) {
        return 'ADMIN';
    }
    if (['FLEET_MANAGER', 'ORGANIZATION_MANAGER', 'MANAGER'].includes(r)) {
        return 'FLEET_MANAGER';
    }
    if (['FLEET_DRIVER', 'DRIVER'].includes(r)) {
        return 'DRIVER';
    }
    return '';
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
    /**
     * Login unifié : POST /v1/auth/login { identifier, password }.
     * Le DES-Backend répond { success, message, data: { accessToken, refreshToken, user } }.
     * On déroule le wrapper 'data' avant de persister la session.
     */
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        try {
            // La réponse brute est { success, message, data: DESAuthData }
            const rawRes = await apiClient.postSilent<DESAuthApiResponse>('/v1/auth/login', {
                identifier: credentials.email,
                password: credentials.password,
            });

            // Déballer le wrapper DES-Backend
            const res: BackendAuthResponse = rawRes.data ?? (rawRes as any);

            if (!res || !res.accessToken) {
                throw new Error((rawRes as any).message || 'Réponse inattendue du serveur');
            }

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
                organizationId: (res.user as any).organizationId ?? null,
                adminId: (res.user as any).organizationId || res.user.id,
                profilePhotoUrl: res.user.photoUrl,
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

    /** Profil de l'utilisateur connecté — réponse { success, data: UserDetail }. */
    me: async (): Promise<BackendUserDetail> => {
        const raw = await apiClient.get<any>('/v1/auth/me');
        // Déballer si le backend enveloppe dans { data: ... }
        return (raw?.data ?? raw) as BackendUserDetail;
    },

    /** Rafraichit le jeton d'accès — même format enveloppé que login. */
    refresh: async (refreshToken: string): Promise<BackendAuthResponse> => {
        const rawRes = await apiClient.postSilent<DESAuthApiResponse>('/v1/auth/refresh', { refreshToken });
        const res: BackendAuthResponse = rawRes.data ?? (rawRes as any);
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

    /** Upload du logo de la societe. */
    uploadCompanyLogo: async (fileUri: string, mimeType: string, fileName: string): Promise<Organization> => {
        return apiClient.uploadFile<Organization>('/v1/fleet-managers/me/company/logo', fileUri, mimeType, fileName);
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

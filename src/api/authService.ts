/**
 * Service Auth — login, refresh, me, mot de passe, inscription publique.
 */

import { apiClient } from './client';
import { resolveFleetRole } from './roles';
import { clearSession, persistSession } from './session';
import type { DESAuthApiResponse, BackendAuthResponse, BackendUserDetail } from '../types/api';
import type { LoginRequest, LoginResponse } from '../types';

/** Rôle canonique le plus élevé parmi la liste Kernel (un des 4 FLEET_*). */
export const primaryRole = (roles: string[] = []): string =>
    resolveFleetRole({ roles }) ?? (roles[0] ?? '');

const unwrapAuth = (raw: DESAuthApiResponse | BackendAuthResponse): BackendAuthResponse => {
    const res = (raw as DESAuthApiResponse).data ?? (raw as BackendAuthResponse);
    return res;
};

export const AuthService = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        try {
            const rawRes = await apiClient.postSilent<DESAuthApiResponse>('/v1/auth/login', {
                identifier: credentials.email,
                password: credentials.password,
            });

            const res = unwrapAuth(rawRes);

            if (!res || !res.accessToken) {
                throw new Error((rawRes as DESAuthApiResponse).message || 'Réponse inattendue du serveur');
            }

            await persistSession(res);

            const role = primaryRole(res.user.roles);
            return {
                success: true,
                message: 'Connexion reussie',
                userId: 0,
                userUuid: res.user.id,
                email: res.user.email,
                fullName: `${res.user.firstName ?? ''} ${res.user.lastName ?? ''}`.trim(),
                role,
                userType: role,
                roles: res.user.roles,
                organizationId: res.user.organizationId ?? undefined,
                adminId: res.user.organizationId || res.user.id,
                profilePhotoUrl: res.user.photoUrl ?? undefined,
                phone: res.user.phone ?? undefined,
                vehicleId: res.user.vehicleId ?? null,
            };
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Identifiants incorrects';
            return {
                success: false,
                message,
                userId: 0,
                email: '',
                fullName: '',
                role: '',
                userType: '',
            };
        }
    },

    getMe: async (): Promise<BackendUserDetail> => {
        const raw = await apiClient.get<{ data?: BackendUserDetail } & BackendUserDetail>('/v1/auth/me');
        return (raw?.data ?? raw) as BackendUserDetail;
    },

    refresh: async (token: string): Promise<BackendAuthResponse> => {
        const rawRes = await apiClient.postSilent<DESAuthApiResponse>('/v1/auth/refresh', { refreshToken: token });
        const res = unwrapAuth(rawRes);
        await persistSession(res);
        return res;
    },

    logout: async (): Promise<void> => clearSession(),

    forgotPassword: async (email: string): Promise<void> => {
        await apiClient.post('/v1/auth/forgot-password', { email });
    },

    resetPassword: async (resetToken: string, newPassword: string): Promise<void> => {
        await apiClient.post('/v1/auth/reset-password', { resetToken, newPassword });
    },

    registerManager: async (registrationData: unknown): Promise<{ id: string; status: string; message: string }> => {
        return apiClient.post('/v1/public/register-manager', registrationData);
    },

    subscriptionPlans: async (): Promise<unknown[]> => {
        return apiClient.get<unknown[]>('/v1/public/subscription-plans');
    },
};

/** Alias conservé temporairement. */
export const authApi = AuthService;

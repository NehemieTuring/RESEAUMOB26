/**
 * Session JWT hors React : mémoire + AsyncStorage.
 * Le client HTTP lit le token ici ; les écrans ne touchent plus apiClient.setToken.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BackendAuthResponse, BackendUserDetail } from '../types/api';
import { FLEET_ROLES, isPlatformAdmin, normalizeFleetRole, resolveFleetRole, type FleetRole } from './roles';

export const AUTH_TOKEN_KEY = '@fleetman_auth_token';
export const REFRESH_TOKEN_KEY = '@fleetman_refresh_token';
export const USER_DATA_KEY = '@fleetman_user_data';
/** Clés UI historiques (login.tsx, DashboardHeader, more.tsx). */
const UI_USER_KEY = 'user';
const IS_LOGGED_IN_KEY = 'isLoggedIn';

let accessToken: string | null = null;
let refreshToken: string | null = null;

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string | null): void => {
    accessToken = token;
};

export const getRefreshToken = async (): Promise<string | null> => {
    if (refreshToken) return refreshToken;
    return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
};

export const persistTokens = async (access: string, refresh?: string | null): Promise<void> => {
    accessToken = access;
    const pairs: [string, string][] = [[AUTH_TOKEN_KEY, access]];
    if (refresh) {
        refreshToken = refresh;
        pairs.push([REFRESH_TOKEN_KEY, refresh]);
    }
    await AsyncStorage.multiSet(pairs);
};

export const persistSession = async (auth: BackendAuthResponse): Promise<void> => {
    await persistTokens(auth.accessToken, auth.refreshToken);
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(auth.user));
};

export const restoreSession = async (): Promise<BackendUserDetail | null> => {
    const [token, storedRefresh, raw] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(REFRESH_TOKEN_KEY),
        AsyncStorage.getItem(USER_DATA_KEY),
    ]);
    if (!token) return null;
    accessToken = token;
    refreshToken = storedRefresh;
    try {
        return raw ? (JSON.parse(raw) as BackendUserDetail) : null;
    } catch {
        return null;
    }
};

const roleFromUrl = (): FleetRole | null => {
    if (typeof window === 'undefined') return null;
    try {
        return normalizeFleetRole(new URLSearchParams(window.location.search).get('role'));
    } catch {
        return null;
    }
};

/**
 * Permet de parcourir les écrans sans JWT ni backend.
 * - sans session : profil d'aperçu (admin par défaut)
 * - `?role=FLEET_MANAGER` (ou DRIVER / ADMIN / SUPER_ADMIN) force le rôle affiché
 */
export const ensureBrowseSession = async (): Promise<void> => {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (token) return;

    const urlRole = roleFromUrl();
    let existing: { guestPreview?: boolean; role?: string; userType?: string } | null = null;
    try {
        const raw = await AsyncStorage.getItem(UI_USER_KEY);
        existing = raw ? JSON.parse(raw) : null;
    } catch {
        existing = null;
    }

    const isGuest = !existing || existing.guestPreview === true;
    if (!isGuest && !urlRole) return;

    const role: FleetRole =
        urlRole ?? normalizeFleetRole(existing?.role) ?? normalizeFleetRole(existing?.userType) ?? FLEET_ROLES.ADMIN;

    await AsyncStorage.setItem(
        UI_USER_KEY,
        JSON.stringify({
            guestPreview: true,
            userId: 'guest',
            userUuid: 'guest',
            email: 'guest@local',
            fullName: 'Aperçu',
            role,
            userType: role,
            roles: [role],
        })
    );
};

export const isAdminRole = (role?: string): boolean =>
    isPlatformAdmin(normalizeFleetRole(role));

/** true si le compte connecté est FLEET_ADMIN ou FLEET_SUPER_ADMIN. */
export const isAdminSession = async (): Promise<boolean> => {
    const [rawKernel, rawUi] = await Promise.all([
        AsyncStorage.getItem(USER_DATA_KEY),
        AsyncStorage.getItem(UI_USER_KEY),
    ]);
    try {
        if (rawKernel) {
            const user = JSON.parse(rawKernel) as BackendUserDetail;
            if (isPlatformAdmin(resolveFleetRole(user))) return true;
        }
        if (rawUi) {
            const user = JSON.parse(rawUi) as { userType?: string; role?: string; roles?: string[] };
            if (isPlatformAdmin(resolveFleetRole(user))) return true;
        }
    } catch {
        // ignore parse errors
    }
    return false;
};

export const clearSession = async (): Promise<void> => {
    accessToken = null;
    refreshToken = null;
    await AsyncStorage.multiRemove([
        AUTH_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_DATA_KEY,
        UI_USER_KEY,
        IS_LOGGED_IN_KEY,
    ]);
};

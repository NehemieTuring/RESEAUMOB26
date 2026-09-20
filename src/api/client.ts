/**
 * Client HTTP central (fetch). Injecte le Bearer, tente un refresh sur 401,
 * puis notifie l'UI si la session est réellement expirée.
 */

import { Platform } from 'react-native';
import { API_BASE_URL, getApiBaseUrl } from '../constants/Config';
import { showGlobalToast } from '../context/ToastContext';
import { ApiError } from './errors';
import {
    clearSession,
    ensureBrowseSession,
    getAccessToken,
    getRefreshToken,
    persistTokens,
    setAccessToken,
} from './session';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestConfig {
    method: Method;
    headers?: Record<string, string>;
    body?: unknown;
    silent?: boolean;
    skipAuth?: boolean;
}

let onSessionExpired: (() => void) | null = null;

export const setOnSessionExpired = (cb: (() => void) | null): void => {
    onSessionExpired = cb;
};

export class ApiClient {
    private baseUrl: string;
    private refreshing: Promise<boolean> | null = null;

    constructor(baseUrl: string = getApiBaseUrl()) {
        this.baseUrl = baseUrl;
    }

    setBaseUrl(baseUrl: string): void {
        this.baseUrl = baseUrl;
        console.log(`[API] Base URL updated to: ${this.baseUrl}`);
    }

    /** Compat : les anciens services appelaient apiClient.setToken. */
    setToken(token: string | null): void {
        setAccessToken(token);
    }

    private async request<T>(endpoint: string, config: RequestConfig): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const isFormData = typeof FormData !== 'undefined' && config.body instanceof FormData;

        const headers: Record<string, string> = { ...config.headers };
        if (!isFormData) {
            headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
        }

        const token = getAccessToken();
        if (token && !config.skipAuth) {
            headers.Authorization = `Bearer ${token}`;
        }

        const fetchConfig: RequestInit = {
            method: config.method,
            headers,
        };

        if (config.body != null && config.method !== 'GET') {
            fetchConfig.body = isFormData ? (config.body as FormData) : JSON.stringify(config.body);
        }

        console.log(`[API] ${config.method} ${endpoint}`);

        try {
            const response = await fetch(url, fetchConfig);

            if (response.status === 401 && !config.silent) {
                const hadToken = Boolean(getAccessToken());
                const refreshed = hadToken ? await this.tryRefresh() : false;
                if (refreshed) {
                    return this.request<T>(endpoint, { ...config, silent: true });
                }
                if (hadToken) {
                    await clearSession();
                    await ensureBrowseSession();
                    showGlobalToast('Votre session a expiré. Vous pouvez continuer à parcourir l’app.', 'error');
                }
                throw new ApiError(
                    hadToken
                        ? 'Votre session a expiré. Veuillez vous reconnecter.'
                        : 'Non authentifié',
                    401,
                    'AUTH_005'
                );
            }

            if (!response.ok) {
                let message = `Erreur HTTP: ${response.status}`;
                let code: string | undefined;
                try {
                    const errorData = await response.json();
                    message = errorData.detail || errorData.message || message;
                    code = errorData.code;
                } catch {
                    // corps non JSON
                }
                throw new ApiError(message, response.status, code);
            }

            const text = await response.text();
            if (!text || text.trim() === '') {
                return {} as T;
            }
            return JSON.parse(text) as T;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            console.error(`[API ERROR] ${config.method} ${url}:`, error);
            throw error;
        }
    }

    private async tryRefresh(): Promise<boolean> {
        if (this.refreshing) return this.refreshing;

        this.refreshing = (async () => {
            const refreshToken = await getRefreshToken();
            if (!refreshToken) return false;
            try {
                const raw = await this.request<{
                    data?: { accessToken: string; refreshToken?: string };
                    accessToken?: string;
                    refreshToken?: string;
                }>('/v1/auth/refresh', {
                    method: 'POST',
                    body: { refreshToken },
                    silent: true,
                    skipAuth: true,
                });
                const tokens = raw.data ?? raw;
                if (!tokens?.accessToken) return false;
                await persistTokens(tokens.accessToken, tokens.refreshToken);
                return true;
            } catch {
                return false;
            }
        })();

        try {
            return await this.refreshing;
        } finally {
            this.refreshing = null;
        }
    }

    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, body?: unknown): Promise<T> {
        return this.request<T>(endpoint, { method: 'POST', body });
    }

    /** Login / refresh : pas de toast, pas de logout, pas de Bearer. */
    async postSilent<T>(endpoint: string, body?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body,
            silent: true,
            skipAuth: true,
        });
    }

    async put<T>(endpoint: string, body?: unknown): Promise<T> {
        return this.request<T>(endpoint, { method: 'PUT', body });
    }

    async patch<T>(endpoint: string, body?: unknown): Promise<T> {
        return this.request<T>(endpoint, { method: 'PATCH', body });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    async uploadFile<T>(endpoint: string, fileUri: string, mimeType: string, fileName: string): Promise<T> {
        const formData = new FormData();

        if (Platform.OS === 'web') {
            const res = await fetch(fileUri);
            const blob = await res.blob();
            formData.append('file', blob, fileName);
        } else {
            formData.append('file', {
                uri: fileUri,
                name: fileName,
                type: mimeType || 'application/octet-stream',
            } as unknown as Blob);
        }

        return this.request<T>(endpoint, { method: 'POST', body: formData });
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
export { API_BASE_URL };

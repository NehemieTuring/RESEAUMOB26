/**
 * FleetMan Mobile - Backend Health Check Service
 * Checks if the backend server is accessible
 */

import { API_BASE_URL } from '../constants/Config';

export interface HealthCheckResult {
    isOnline: boolean;
    message: string;
    responseTime?: number;
}

/**
 * Check if the backend server is accessible
 * @param timeoutMs Timeout in milliseconds (default 5000)
 */
export async function checkBackendHealth(timeoutMs: number = 5000): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        // Try to access a simple endpoint
        const response = await fetch(`${API_BASE_URL}/vehicles`, {
            method: 'HEAD',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseTime = Date.now() - startTime;

        if (response.ok || response.status === 401 || response.status === 403) {
            // 401/403 means server is online but needs auth - that's fine
            return {
                isOnline: true,
                message: 'Serveur connecté',
                responseTime,
            };
        }

        return {
            isOnline: false,
            message: `Erreur serveur: ${response.status}`,
            responseTime,
        };
    } catch (error: any) {
        const responseTime = Date.now() - startTime;

        if (error.name === 'AbortError') {
            return {
                isOnline: false,
                message: 'Délai de connexion dépassé. Le serveur ne répond pas.',
                responseTime,
            };
        }

        // Network error - server is offline
        return {
            isOnline: false,
            message: 'Impossible de se connecter au serveur. Vérifiez que le backend est lancé.',
            responseTime,
        };
    }
}

/**
 * Wrapper for API calls that checks backend health first
 * Returns null and shows alert if backend is offline
 */
export async function withHealthCheck<T>(
    apiCall: () => Promise<T>,
    onOffline?: () => void
): Promise<{ data: T | null; isOnline: boolean; error?: string }> {
    const health = await checkBackendHealth(3000);

    if (!health.isOnline) {
        if (onOffline) {
            onOffline();
        }
        return {
            data: null,
            isOnline: false,
            error: health.message,
        };
    }

    try {
        const data = await apiCall();
        return {
            data,
            isOnline: true,
        };
    } catch (error: any) {
        return {
            data: null,
            isOnline: true,
            error: error.message || 'Erreur lors de la requête',
        };
    }
}

export default { checkBackendHealth, withHealthCheck };

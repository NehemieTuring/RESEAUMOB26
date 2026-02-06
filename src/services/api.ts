/**
 * FleetMan Mobile - API Configuration
 * Axios client configured for Spring Boot backend
 */

import { API_BASE_URL } from '../constants/Config';
import { showGlobalToast } from '../context/ToastContext';

interface RequestConfig {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    silent?: boolean; // Don't show toast for this request
}

class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    setBaseUrl(baseUrl: string) {
        this.baseUrl = baseUrl;
        console.log(`[API] Base URL updated to: ${this.baseUrl}`);
    }

    setToken(token: string | null) {
        this.token = token;
    }

    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    private async request<T>(endpoint: string, config: RequestConfig): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const isFormData = config.body instanceof FormData;
        const headers = this.getHeaders();

        if (isFormData) {
            delete headers['Content-Type'];
        }

        const fetchConfig: RequestInit = {
            method: config.method,
            headers: {
                ...headers,
                ...config.headers,
            },
        };

        if (config.body && config.method !== 'GET') {
            fetchConfig.body = isFormData ? config.body : JSON.stringify(config.body);
        }

        console.log(`[API] ${config.method} ${url}`, isFormData ? '[FormData]' : (config.body ? JSON.stringify(config.body) : ''));

        try {
            const response = await fetch(url, fetchConfig);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error(`[API Error] ${response.status}:`, errorData);

                // Show user-friendly error notification
                if (!config.silent) {
                    const errorMessage = errorData.message || `Erreur ${response.status}: ${response.statusText}`;
                    showGlobalToast(errorMessage, 'error');
                }

                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            // Handle empty responses (204 No Content)
            if (response.status === 204) {
                return {} as T;
            }

            const data = await response.json();
            console.log(`[API Response]`, data);
            return data;
        } catch (error: any) {
            // Check if it's a network error (backend not reachable)
            if (error.message === 'Network request failed' || error.name === 'TypeError') {
                console.error('[API Error] Serveur inaccessible:', error);
                if (!config.silent) {
                    showGlobalToast('🔌 Serveur inaccessible. Vérifiez votre connexion ou le backend.', 'error', 5000);
                }
            } else {
                console.error('[API Error]', error);
            }
            throw error;
        }
    }

    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, body?: any): Promise<T> {
        return this.request<T>(endpoint, { method: 'POST', body });
    }

    async put<T>(endpoint: string, body?: any): Promise<T> {
        return this.request<T>(endpoint, { method: 'PUT', body });
    }

    async patch<T>(endpoint: string, body?: any): Promise<T> {
        return this.request<T>(endpoint, { method: 'PATCH', body });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

// Export singleton instance
const apiClient = new ApiClient(API_BASE_URL);

export default apiClient;
export { API_BASE_URL, ApiClient };

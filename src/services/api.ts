/**
 * FleetMan Mobile - API Configuration
 * Axios client configured for Spring Boot backend
 */

import { Platform } from 'react-native';
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

        console.log(`[API] Sending ${config.method} request to ${endpoint} with headers:`, fetchConfig.headers);

        // --- REAL FETCH EXECUTION ---
        // (L'interception "mock" qui court-circuitait tous les appels a ete supprimee :
        //  l'application dialogue desormais reellement avec le backend.)
        try {
            console.log(`[API REAL] Executing ${config.method} ${url}`);
            const response = await fetch(url, fetchConfig);
            
            // Check if response is ok
            if (!response.ok) {
                let errorMessage = `Erreur HTTP: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.detail || errorMessage;
                } catch (e) {
                    // response is not json
                }
                throw new Error(errorMessage);
            }

            const text = await response.text();
            if (!text || text.trim() === '') {
                return {} as T;
            }
            return JSON.parse(text) as T;
        } catch (error) {
            console.error(`[API ERROR] ${config.method} ${url}:`, error);
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

    async uploadFile<T>(endpoint: string, fileUri: string, mimeType: string, fileName: string): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const formData = new FormData();

        if (Platform.OS === 'web') {
            try {
                const res = await fetch(fileUri);
                const blob = await res.blob();
                formData.append('file', blob, fileName);
            } catch (e) {
                console.error("Failed to convert fileUri to blob on web:", e);
                throw e;
            }
        } else {
            formData.append('file', {
                uri: fileUri,
                name: fileName,
                type: mimeType || 'application/octet-stream',
            } as any);
        }

        const headers: Record<string, string> = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        // No Content-Type, fetch will add multipart/form-data with boundary
        
        console.log(`[API] Uploading file to ${url} with headers:`, headers);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: formData,
            });

            if (!response.ok) {
                let errorMessage = `Erreur HTTP: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.detail || errorMessage;
                } catch (e) {}
                throw new Error(errorMessage);
            }

            return response.json();
        } catch (error) {
            console.error(`[API ERROR] POST ${url}:`, error);
            throw error;
        }
    }
}

// Export singleton instance
const apiClient = new ApiClient(API_BASE_URL);

export default apiClient;
export { API_BASE_URL, ApiClient };

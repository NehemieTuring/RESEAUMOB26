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
        const formData = new FormData();

        if (Platform.OS === 'web') {
            // Sur le web, FormData exige un vrai Blob/File : un objet { uri, name, type }
            // serait serialise en "[object Object]" et produirait un multipart invalide.
            const res = await fetch(fileUri);
            const blob = await res.blob();
            formData.append('file', blob, fileName);
        } else {
            // Sur iOS/Android, React Native accepte directement cet objet.
            formData.append('file', {
                uri: fileUri,
                name: fileName,
                type: mimeType || 'application/octet-stream',
            } as any);
        }

        // NE PAS definir Content-Type manuellement : le runtime doit generer
        // l'en-tete avec le "boundary", sinon le serveur ne peut pas parser le corps
        // (erreur "Failed to parse multipart servlet request").
        return this.request<T>(endpoint, {
            method: 'POST',
            body: formData,
        });
    }
}

// Export singleton instance
const apiClient = new ApiClient(API_BASE_URL);

export default apiClient;
export { API_BASE_URL, ApiClient };

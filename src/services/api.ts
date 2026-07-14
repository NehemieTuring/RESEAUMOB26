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

        console.log(`[API MOCK] Intercepted ${config.method} ${url}`, isFormData ? '[FormData]' : (config.body ? JSON.stringify(config.body) : ''));

        // Short-circuit API calls and return mock data to prevent backend queries
        return new Promise<T>((resolve) => {
            setTimeout(() => {
                if (config.method === 'GET') {
                    // Try to guess the expected return type based on endpoint name
                    if (
                        endpoint.includes('all') || 
                        endpoint.includes('list') || 
                        endpoint.includes('recent') ||
                        endpoint.includes('vehicles') ||
                        endpoint.includes('fleets') ||
                        endpoint.includes('drivers') ||
                        endpoint.includes('managers') ||
                        endpoint.includes('incidents') ||
                        endpoint.includes('notifications')
                    ) {
                        if (!endpoint.includes('/count') && !endpoint.includes('unread')) {
                            return resolve([] as unknown as T);
                        }
                    }
                    if (endpoint.includes('count') || endpoint.includes('unread')) {
                        return resolve(0 as unknown as T);
                    }
                    return resolve({} as unknown as T);
                } else if (endpoint.includes('login')) {
                    return resolve({ 
                        success: true, 
                        userId: 1, 
                        email: 'test@example.com', 
                        fullName: 'Test User', 
                        role: 'SUPER_ADMIN',
                        userType: 'ADMIN',
                        organizationId: 1
                    } as unknown as T);
                } else {
                    return resolve({ success: true, message: 'Action mockée avec succès' } as unknown as T);
                }
            }, 100); // Simulate network delay
        });
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

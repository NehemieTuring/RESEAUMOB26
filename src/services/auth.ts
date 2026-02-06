/**
 * FleetMan Mobile - Auth Service
 * Authentication state management with AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';

// Types for authentication
export interface User {
    userId: number;
    userName: string;
    userEmail: string;
    userPhoneNumber?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    userName: string;
    userEmail: string;
    userPassword: string;
    userPhoneNumber?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    refreshToken: string;
}

const AUTH_TOKEN_KEY = '@fleetman_auth_token';
const REFRESH_TOKEN_KEY = '@fleetman_refresh_token';
const USER_DATA_KEY = '@fleetman_user_data';

class AuthService {
    private user: User | null = null;
    private listeners: Set<(user: User | null) => void> = new Set();

    async initialize(): Promise<User | null> {
        try {
            const [token, userData] = await Promise.all([
                AsyncStorage.getItem(AUTH_TOKEN_KEY),
                AsyncStorage.getItem(USER_DATA_KEY),
            ]);

            if (token && userData) {
                apiClient.setToken(token);
                this.user = JSON.parse(userData);
                this.notifyListeners();
                return this.user;
            }
            return null;
        } catch (error) {
            console.error('Error initializing auth:', error);
            return null;
        }
    }

    async login(credentials: LoginCredentials): Promise<User> {
        try {
            const response: AuthResponse = await apiClient.post<AuthResponse>('/auth/login', credentials);
            await this.saveAuthData(response);
            return response.user;
        } catch (error) {
            throw error;
        }
    }

    async register(data: RegisterData): Promise<User> {
        try {
            const response: AuthResponse = await apiClient.post<AuthResponse>('/auth/register', data);
            await this.saveAuthData(response);
            return response.user;
        } catch (error) {
            throw error;
        }
    }

    async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.log('Logout API error (ignored):', error);
        } finally {
            await this.clearAuthData();
        }
    }

    private async saveAuthData(response: AuthResponse): Promise<void> {
        apiClient.setToken(response.token);
        this.user = response.user;

        await Promise.all([
            AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token),
            AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken),
            AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user)),
        ]);

        this.notifyListeners();
    }

    private async clearAuthData(): Promise<void> {
        apiClient.setToken(null);
        this.user = null;

        await Promise.all([
            AsyncStorage.removeItem(AUTH_TOKEN_KEY),
            AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
            AsyncStorage.removeItem(USER_DATA_KEY),
        ]);

        this.notifyListeners();
    }

    getUser(): User | null {
        return this.user;
    }

    isAuthenticated(): boolean {
        return this.user !== null;
    }

    subscribe(listener: (user: User | null) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.user));
    }
}

export const authService = new AuthService();
export default authService;

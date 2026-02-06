/**
 * FleetMan Mobile - Authentication & Admin API Services
 * Connected to Spring Boot Backend
 */

import apiClient from './api';
import {
    Admin,
    AdminCreate,
    Organization,
    OrganizationCreate,
    LoginRequest,
    LoginResponse
} from '../types';

// ============ AUTH API ============

export const authApi = {
    // Admin login
    loginAdmin: async (credentials: LoginRequest): Promise<LoginResponse> => {
        return apiClient.post<LoginResponse>('/auth/admin/login', credentials);
    },

    // Fleet Manager login
    loginFleetManager: async (credentials: LoginRequest): Promise<LoginResponse> => {
        return apiClient.post<LoginResponse>('/auth/fleet-manager/login', credentials);
    },

    // Driver login
    loginDriver: async (credentials: LoginRequest): Promise<LoginResponse> => {
        return apiClient.post<LoginResponse>('/auth/driver/login', credentials);
    },

    // Generic login (tries admin first, then fleet manager, then driver)
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        // Try admin login first
        try {
            const response = await apiClient.post<LoginResponse>('/auth/admin/login', credentials);
            if (response.success) return response;
        } catch (e) { /* continue */ }

        // Try fleet manager login
        try {
            const response = await apiClient.post<LoginResponse>('/auth/fleet-manager/login', credentials);
            if (response.success) return response;
        } catch (e) { /* continue */ }

        // Try driver login
        try {
            const response = await apiClient.post<LoginResponse>('/auth/driver/login', credentials);
            if (response.success) return response;
        } catch (e) { /* continue */ }

        // Return error if all fail
        return {
            success: false,
            message: 'Identifiants incorrects',
            userId: 0,
            email: '',
            fullName: '',
            role: '',
            userType: ''
        };
    },

    // Inscription transactionnelle complète (Admin + Organisation en une seule requête)
    registerComplete: async (registrationData: {
        // Admin data
        adminFirstName: string;
        adminLastName: string;
        adminEmail: string;
        adminPassword: string;
        adminPhoneNumber: string;
        adminIdCardNumber?: string;
        personalAddress?: string;
        personalCity?: string;
        personalPostalCode?: string;
        personalCountry?: string;
        taxNumber?: string;
        niu?: string;
        gender: string;
        language?: string;
        // Organization data
        organizationName: string;
        organizationDomainName?: string;
        organizationPhone: string;
        registrationNumber?: string;
        organizationAddress: string;
        organizationCity: string;
        organizationCountry: string;
        organizationUIN?: string;
        organizationTaxId?: string;
        organizationType?: string;
        subscriptionPlan?: string;
    }): Promise<{
        success: boolean;
        message: string;
        admin?: Admin;
        organization?: Organization;
    }> => {
        return apiClient.post('/registration/complete', registrationData);
    },
};

// ============ ADMIN API ============

export const adminApi = {
    // Get all admins
    getAll: async (): Promise<Admin[]> => {
        return apiClient.get<Admin[]>('/admins');
    },

    // Get admin by ID
    getById: async (adminId: number): Promise<Admin> => {
        return apiClient.get<Admin>(`/admins/${adminId}`);
    },

    // Get admin by email
    getByEmail: async (email: string): Promise<Admin> => {
        return apiClient.get<Admin>(`/admins/email/${email}`);
    },

    // Get admins by role
    getByRole: async (role: string): Promise<Admin[]> => {
        return apiClient.get<Admin[]>(`/admins/role/${role}`);
    },

    // Get admin count
    count: async (): Promise<number> => {
        return apiClient.get<number>('/admins/count');
    },

    // Create admin (registration)
    create: async (admin: AdminCreate): Promise<Admin> => {
        return apiClient.post<Admin>('/admins', admin);
    },

    // Update admin
    update: async (adminId: number, admin: Partial<AdminCreate>): Promise<Admin> => {
        return apiClient.put<Admin>(`/admins/${adminId}`, admin);
    },

    // Delete admin
    delete: async (adminId: number): Promise<void> => {
        return apiClient.delete(`/admins/${adminId}`);
    },

    // Change password
    changePassword: async (adminId: number, data: { oldPassword: string; newPassword: string }): Promise<any> => {
        return apiClient.post(`/admins/${adminId}/change-password`, data);
    },

    // Get organization for admin
    getOrganization: async (adminId: number): Promise<Organization> => {
        return apiClient.get<Organization>(`/admins/${adminId}/organization`);
    },

    // Create Super Admin (for registration flow)
    createSuperAdmin: async (admin: AdminCreate): Promise<Admin> => {
        // Try the dedicated superadmin endpoint first
        try {
            return await apiClient.post<Admin>('/admins/superadmin', admin);
        } catch (error: any) {
            // If the endpoint doesn't exist, fall back to creating a regular admin
            // The admin data should already have adminRole: SUPER_ADMIN set
            console.log('[AdminApi] Falling back to regular admin creation...');
            return apiClient.post<Admin>('/admins', admin);
        }
    },
};

// ============ ORGANIZATION API ============

export const organizationApi = {
    // Get all organizations
    getAll: async (): Promise<Organization[]> => {
        return apiClient.get<Organization[]>('/organizations');
    },

    // Get organization by ID
    getById: async (organizationId: number): Promise<Organization> => {
        return apiClient.get<Organization>(`/organizations/${organizationId}`);
    },

    // Get organization count
    count: async (): Promise<number> => {
        return apiClient.get<number>('/organizations/count');
    },

    // Create organization
    create: async (organization: OrganizationCreate): Promise<Organization> => {
        return apiClient.post<Organization>('/organizations', organization);
    },

    // Update organization
    update: async (organizationId: number, organization: Partial<OrganizationCreate>): Promise<Organization> => {
        return apiClient.put<Organization>(`/organizations/${organizationId}`, organization);
    },

    // Delete organization
    delete: async (organizationId: number): Promise<void> => {
        return apiClient.delete(`/organizations/${organizationId}`);
    },

    // Create admin for organization
    createAdmin: async (organizationId: number, admin: AdminCreate): Promise<Admin> => {
        return apiClient.post<Admin>(`/organizations/${organizationId}/admins`, admin);
    },

    // Get admins for organization
    getAdmins: async (organizationId: number): Promise<Admin[]> => {
        return apiClient.get<Admin[]>(`/organizations/${organizationId}/admins`);
    },

    // Upload logo
    uploadLogo: async (organizationId: number, fileUri: string): Promise<Organization> => {
        const formData = new FormData();
        // @ts-ignore
        formData.append('file', {
            uri: fileUri,
            name: 'logo.jpg',
            type: 'image/jpeg',
        });

        return apiClient.post<Organization>(`/organizations/${organizationId}/logo`, formData);
    },
};

export default {
    auth: authApi,
    admin: adminApi,
    organization: organizationApi,
};

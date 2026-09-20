/**
 * Pont Auth / Admin / Compte.
 * L'auth réelle est dans src/api/authService.ts ; account / admin / org
 * restent ici jusqu'aux paliers suivants.
 */

import apiClient from './api';
import { Admin, Organization } from '../types';
import type { BackendUserDetail } from '../types/api';
import { authApi, primaryRole } from '../api/authService';

export type { BackendUserDetail, BackendAuthResponse } from '../types/api';
export { persistSession, restoreSession, clearSession } from '../api/session';
export { authApi, primaryRole };

export const accountApi = {
    updateProfile: async (data: { firstName?: string; lastName?: string; phone?: string }): Promise<BackendUserDetail> => {
        return apiClient.post<BackendUserDetail>('/v1/account/profile', data);
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
        return apiClient.post('/v1/account/password', { currentPassword, newPassword });
    },

    uploadPhoto: async (fileUri: string, mimeType: string, fileName: string): Promise<BackendUserDetail> => {
        const uploaded = await apiClient.uploadFile<BackendUserDetail>('/v1/account/picture', fileUri, mimeType, fileName);
        if (uploaded?.photoUrl) {
            return uploaded;
        }
        return authApi.getMe();
    },

    deleteAccount: async (): Promise<void> => {
        return apiClient.delete('/v1/account');
    },
};

export const adminApi = {
    getManagers: async (): Promise<any[]> => {
        return apiClient.get<any[]>('/v1/admin/management/managers');
    },

    getUser: async (userId: string): Promise<any> => {
        return apiClient.get<any>(`/v1/admin/users/${userId}`);
    },

    activateManager: async (userId: string): Promise<void> => {
        return apiClient.patch(`/v1/admin/management/managers/${userId}/toggle`);
    },

    deactivateManager: async (userId: string): Promise<void> => {
        return apiClient.patch(`/v1/admin/management/managers/${userId}/toggle`);
    },

    deleteManager: async (userId: string): Promise<void> => {
        return apiClient.delete(`/v1/admin/management/managers/${userId}`);
    },

    createAdmin: async (data: any): Promise<Admin> => {
        return apiClient.post<Admin>('/v1/admin/admins', data);
    },

    addRole: async (userId: string, role: string): Promise<void> => {
        return apiClient.post(`/v1/admin/users/${userId}/roles`, { role });
    },

    getStats: async (): Promise<any> => {
        return apiClient.get<any>('/v1/admin/stats');
    },

    getVehicleTypes: async (): Promise<any[]> => {
        return apiClient.get<any[]>('/v1/admin/resources/vehicle-types');
    },

    createVehicleType: async (data: { code: string; label: string; description?: string }): Promise<any> => {
        return apiClient.post('/v1/admin/resources/vehicle-types', data);
    },

    deleteVehicleType: async (id: string): Promise<void> => {
        return apiClient.delete(`/v1/admin/resources/vehicle-types/${id}`);
    },
};

export const organizationApi = {
    updateCompany: async (data: {
        companyName?: string;
        companyPhone?: string;
        companyAddress?: string;
        companyCity?: string;
        companyLogoUrl?: string;
    }): Promise<Organization> => {
        return apiClient.put<Organization>('/v1/fleet-managers/me/company', data);
    },

    uploadCompanyLogo: async (fileUri: string, mimeType: string, fileName: string): Promise<Organization> => {
        return apiClient.uploadFile<Organization>('/v1/fleet-managers/me/company/logo', fileUri, mimeType, fileName);
    },

    getAll: async (): Promise<any[]> => {
        return apiClient.get<any[]>('/v1/fleet-managers');
    },

    getById: async (userId: string): Promise<any> => {
        return apiClient.get<any>(`/v1/fleet-managers/${userId}`);
    },
};

export default {
    auth: authApi,
    account: accountApi,
    admin: adminApi,
    organization: organizationApi,
};

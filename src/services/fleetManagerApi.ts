/**
 * FleetMan Mobile - Fleet Manager API Service
 */

import apiClient from './api';
import { Gender, Language } from '../types';

// Fleet Manager types
export interface FleetManager {
    managerId: string; // Changed to string because backend returns UUID
    managerFirstName: string;
    managerLastName: string;
    managerEmail: string;
    managerPhoneNumber: string;
    managerIdCardNumber: string;
    personalAddress: string;
    personalCity: string;
    personalPostalCode: string;
    personalCountry: string;
    taxNumber: string;
    gender: Gender;
    niu: string;
    language: Language;
    managerState: string;
    adminId: string;
    adminName: string;
    createdAt: string;
    lastLogin: string;
    isActive: boolean;
    fleetsCount: number;
    // Champs d'affichage utilises par certains ecrans (optionnels cote backend).
    numberOfFleets?: number;
    numberOfMembers?: number;
    managerAddress?: string;
}

export interface FleetManagerCreate {
    managerEmail: string;
    managerPassword: string;
    managerLastName: string;
    managerFirstName: string;
    managerPhoneNumber?: string;
    gender?: Gender;
    managerIdCardNumber?: string;
    personalAddress?: string;
    personalCity?: string;
    personalPostalCode?: string;
    personalCountry?: string;
    taxNumber?: string;
    niu?: string;
    language?: Language;
}

export interface FleetManagerUpdate {
    managerLastName?: string;
    managerFirstName?: string;
    managerPhoneNumber?: string;
    gender?: Gender;
    managerIdCardNumber?: string;
    personalAddress?: string;
    personalCity?: string;
    personalPostalCode?: string;
    personalCountry?: string;
    taxNumber?: string;
    niu?: string;
    language?: Language;
}

const toApp = (u: any): FleetManager => ({
    managerId: u.id,
    managerFirstName: u.firstName || '',
    managerLastName: u.lastName || '',
    managerEmail: u.email || '',
    managerPhoneNumber: u.phone || '',
    managerIdCardNumber: '',
    personalAddress: u.companyAddress || '',
    personalCity: u.companyCity || '',
    personalPostalCode: '',
    personalCountry: '',
    taxNumber: '',
    gender: Gender.MALE,
    niu: '',
    language: Language.FR,
    managerState: u.isActive ? 'ACTIVE' : 'INACTIVE',
    adminId: u.organizationId || u.adminId || '',
    adminName: '',
    createdAt: '',
    lastLogin: u.lastLoginAt || '',
    isActive: !!u.isActive,
    fleetsCount: 0,
    numberOfFleets: 0,
    numberOfMembers: 0,
    managerAddress: u.companyAddress || '',
});

export const fleetManagerApi = {
    // Get all fleet managers
    getAll: async (adminId?: string): Promise<FleetManager[]> => {
        const list = await apiClient.get<any[]>('/v1/admin/managers');
        let managers = (list || []).map(toApp);
        if (adminId) {
            managers = managers.filter(m => m.adminId === adminId);
        }
        return managers;
    },

    // Get fleet manager by ID
    getById: async (managerId: string): Promise<FleetManager> => {
        // En attendant un endpoint byId specifique dans l'AdminManagerController, 
        // on recupere la liste et on filtre.
        const list = await apiClient.get<any[]>('/v1/admin/managers');
        const user = (list || []).find(u => u.id === managerId);
        if (!user) throw new Error("Manager non trouvé");
        return toApp(user);
    },

    // Get fleet managers by admin ID
    getByAdminId: async (adminId: string): Promise<FleetManager[]> => {
        const list = await apiClient.get<any[]>('/v1/admin/managers');
        return (list || []).map(toApp);
    },

    // Get fleet manager by email
    getByEmail: async (email: string): Promise<FleetManager> => {
        const list = await apiClient.get<any[]>('/v1/admin/managers');
        const user = (list || []).find(u => u.email === email);
        if (!user) throw new Error("Manager non trouvé");
        return toApp(user);
    },

    // Create fleet manager (Not strictly via admin/managers, but via /auth/register-manager usually)
    create: async (adminId: string, manager: FleetManagerCreate): Promise<FleetManager> => {
        // Appelle la vraie route de création
        return toApp(await apiClient.post<any>('/v1/admin/managers', {
            username: manager.managerEmail, // Utilise l'email comme nom d'utilisateur par défaut
            password: manager.managerPassword,
            email: manager.managerEmail,
            phone: manager.managerPhoneNumber,
            firstName: manager.managerFirstName,
            lastName: manager.managerLastName,
            roles: ['FLEET_MANAGER']
        }));
    },

    // Update fleet manager
    update: async (managerId: string, manager: FleetManagerUpdate): Promise<FleetManager> => {
        // The backend uses /api/v1/users/{userId} maybe? AdminController doesn't have an update endpoint
        // just activate/deactivate. For now we just return mocked app data
        return toApp({ id: managerId, firstName: manager.managerFirstName, lastName: manager.managerLastName });
    },

    // Delete fleet manager
    delete: async (managerId: string): Promise<void> => {
        return apiClient.delete(`/v1/admin/managers/${managerId}`);
    },

    // Activate/Deactivate manager
    setActive: async (managerId: string, isActive: boolean): Promise<FleetManager> => {
        const endpoint = isActive ? 'activate' : 'deactivate';
        return toApp(await apiClient.post<any>(`/v1/admin/managers/${managerId}/${endpoint}`));
    },
};

export default fleetManagerApi;

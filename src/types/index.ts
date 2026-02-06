/**
 * FleetMan Mobile - Types & Enums
 * Matching the web application types
 */

// ============ ENUMS ============

export enum AdminRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ORGANIZATION_MANAGER = 'ORGANIZATION_MANAGER',
}

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
}

export enum Language {
    FR = 'FR',
    ENG = 'ENG',
}

export enum OrganizationType {
    OTHER = 'OTHER',
    ASSOCIATION = 'ASSOCIATION',
    LLC = 'LLC',
    COOPERATIVE = 'COOPERATIVE',
    SA = 'SA',
    PUBLIC_ESTABLISHMENT = 'PUBLIC_ESTABLISHMENT',
    EIG = 'EIG',
}

export enum SubscriptionPlan {
    FREE = 'FREE',
    BASIC = 'BASIC',
    PROFESSIONAL = 'PROFESSIONAL',
    ENTERPRISE = 'ENTERPRISE',
}

export enum VehicleState {
    PARKED = 'PARKED',
    MOVING = 'MOVING',
    IDLE = 'IDLE',
    MAINTENANCE = 'MAINTENANCE',
    OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

export enum VehicleType {
    CAR = 'CAR',
    TRUCK = 'TRUCK',
    VAN = 'VAN',
    BUS = 'BUS',
    MOTORCYCLE = 'MOTORCYCLE',
    TRAILER = 'TRAILER',
}

// ============ AUTH TYPES ============

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    userId: number;
    email: string;
    fullName: string;
    role: string;
    userType: string;
    message: string;
    success: boolean;
    organizationId?: number;
    adminId?: number;
}

// ============ ADMIN TYPES ============

export interface Admin {
    adminId: number;
    adminEmail: string;
    adminFirstName: string;
    adminLastName: string;
    adminPhoneNumber: string;
    adminRole: AdminRole;
    adminIdCardNumber: string;
    personalAddress: string;
    personalCity: string;
    personalPostalCode: string;
    personalCountry: string;
    taxNumber: string;
    gender: Gender;
    niu: string;
    language: Language;
    createdAt: string;
    lastLogin: string;
    isActive: boolean;
    organizationId?: number;
    organizationName?: string;
}

export interface AdminCreate {
    adminEmail: string;
    adminPassword: string;
    adminLastName: string;
    adminFirstName: string;
    adminPhoneNumber?: string;
    gender?: Gender;
    adminRole: AdminRole;
    adminIdCardNumber?: string;
    personalAddress?: string;
    personalCity?: string;
    personalPostalCode?: string;
    personalCountry?: string;
    taxNumber?: string;
    niu?: string;
    language?: Language;
}

// ============ ORGANIZATION TYPES ============

export interface Organization {
    organizationId: number;
    organizationName: string;
    organizationDomainName: string;
    organizationPhone: string;
    organizationAddress: string;
    organizationCity: string;
    organizationCountry: string;
    organizationLogo?: string;
    logoUrl?: string;
    logoFileName?: string;
    organizationType: OrganizationType;
    registrationNumber: string;
    taxId: string;
    organizationUIN: string;
    isActive: boolean;
    subscriptionPlan: SubscriptionPlan;
    subscriptionExpiry: string;
    createdAt: string;
}

export interface OrganizationCreate {
    organizationName: string;
    organizationDomainName?: string;
    organizationPhone: string;
    organizationAddress: string;
    organizationCity: string;
    organizationCountry: string;
    organizationType: OrganizationType;
    registrationNumber: string;
    taxId?: string;
    organizationUIN: string;
    subscriptionPlan: SubscriptionPlan;
    createdByAdminId: number;
    organizationLogo?: string;
}

// ============ ENUM TRANSLATIONS ============

export const GenderLabels: Record<Gender, { FR: string; ENG: string }> = {
    [Gender.MALE]: { FR: 'Homme', ENG: 'Male' },
    [Gender.FEMALE]: { FR: 'Femme', ENG: 'Female' },
};

export const OrganizationTypeLabels: Record<OrganizationType, { FR: string; ENG: string }> = {
    [OrganizationType.LLC]: { FR: 'SARL / EURL', ENG: 'LLC' },
    [OrganizationType.SA]: { FR: 'Société Anonyme (SA)', ENG: 'Public Limited Company' },
    [OrganizationType.COOPERATIVE]: { FR: 'Coopérative', ENG: 'Cooperative' },
    [OrganizationType.ASSOCIATION]: { FR: 'Association', ENG: 'Association' },
    [OrganizationType.PUBLIC_ESTABLISHMENT]: { FR: 'Établissement Public', ENG: 'Public Establishment' },
    [OrganizationType.EIG]: { FR: 'GIE', ENG: 'Economic Interest Grouping' },
    [OrganizationType.OTHER]: { FR: 'Autre', ENG: 'Other' },
};

export const SubscriptionPlanLabels: Record<SubscriptionPlan, { FR: string; ENG: string }> = {
    [SubscriptionPlan.FREE]: { FR: 'Gratuit', ENG: 'Free' },
    [SubscriptionPlan.BASIC]: { FR: 'Basique', ENG: 'Basic' },
    [SubscriptionPlan.PROFESSIONAL]: { FR: 'Professionnel', ENG: 'Professional' },
    [SubscriptionPlan.ENTERPRISE]: { FR: 'Entreprise', ENG: 'Enterprise' },
};

// ============ REGISTRATION FORM DATA ============

export interface RegistrationFormData {
    // Step 1 - Personal Info
    adminFirstName: string;
    adminLastName: string;
    adminEmail: string;
    adminPhoneNumber: string;
    adminIdCardNumber: string;
    gender: Gender;
    personalAddress: string;
    personalCity: string;
    personalPostalCode: string;
    personalCountry: string;
    niu: string;
    taxNumber?: string;

    // Step 2 - Account
    adminPassword: string;
    confirmPassword: string;

    // Step 3 - Organization
    organizationName: string;
    organizationDomainName?: string;
    organizationPhone: string;
    registrationNumber: string;
    organizationAddress: string;
    organizationCity: string;
    organizationCountry: string;
    organizationUIN: string;
    organizationType: OrganizationType;
    subscriptionPlan: SubscriptionPlan;
    organizationLogo?: string;
}

/**
 * Les 4 rôles FleetMan — alignés sur le backend (enum FleetRole).
 * Ne pas inventer d'autres codes côté UI (ADMIN, ORGANIZATION_MANAGER, etc.).
 */

export const FLEET_ROLES = {
    DRIVER: 'FLEET_DRIVER',
    MANAGER: 'FLEET_MANAGER',
    ADMIN: 'FLEET_ADMIN',
    SUPER_ADMIN: 'FLEET_SUPER_ADMIN',
} as const;

export type FleetRole = (typeof FLEET_ROLES)[keyof typeof FLEET_ROLES];

const ALL_ROLES: FleetRole[] = [
    FLEET_ROLES.SUPER_ADMIN,
    FLEET_ROLES.ADMIN,
    FLEET_ROLES.MANAGER,
    FLEET_ROLES.DRIVER,
];

const ALIASES: Record<string, FleetRole> = {
    FLEET_DRIVER: FLEET_ROLES.DRIVER,
    DRIVER: FLEET_ROLES.DRIVER,
    ROLE_FLEET_DRIVER: FLEET_ROLES.DRIVER,
    ROLE_DRIVER: FLEET_ROLES.DRIVER,
    FLEET_MANAGER: FLEET_ROLES.MANAGER,
    MANAGER: FLEET_ROLES.MANAGER,
    ROLE_FLEET_MANAGER: FLEET_ROLES.MANAGER,
    ORGANIZATION_MANAGER: FLEET_ROLES.MANAGER,
    ROLE_ORGANIZATION_MANAGER: FLEET_ROLES.MANAGER,
    FLEET_ADMIN: FLEET_ROLES.ADMIN,
    ADMIN: FLEET_ROLES.ADMIN,
    ROLE_FLEET_ADMIN: FLEET_ROLES.ADMIN,
    ROLE_ADMIN: FLEET_ROLES.ADMIN,
    FLEET_SUPER_ADMIN: FLEET_ROLES.SUPER_ADMIN,
    SUPER_ADMIN: FLEET_ROLES.SUPER_ADMIN,
    ROLE_FLEET_SUPER_ADMIN: FLEET_ROLES.SUPER_ADMIN,
    ROLE_SUPER_ADMIN: FLEET_ROLES.SUPER_ADMIN,
};

export type RoleBearer = {
    role?: string | null;
    roles?: string[] | null;
    userType?: string | null;
};

const strip = (value?: string | null): string =>
    (value ?? '').replace(/^ROLE_/, '').toUpperCase();

export const normalizeFleetRole = (role?: string | null): FleetRole | null => {
    if (!role) return null;
    const key = role.toUpperCase();
    return ALIASES[key] ?? ALIASES[strip(role)] ?? null;
};

/** Rôle effectif : le plus élevé parmi roles[], sinon role / userType. */
export const resolveFleetRole = (user?: RoleBearer | null): FleetRole | null => {
    if (!user) return null;
    const fromList = ALL_ROLES.find((r) =>
        (user.roles ?? []).some((raw) => normalizeFleetRole(raw) === r)
    );
    if (fromList) return fromList;
    return normalizeFleetRole(user.role) ?? normalizeFleetRole(user.userType);
};

export const isDriver = (role?: FleetRole | null): boolean => role === FLEET_ROLES.DRIVER;
export const isManager = (role?: FleetRole | null): boolean => role === FLEET_ROLES.MANAGER;
export const isAdmin = (role?: FleetRole | null): boolean => role === FLEET_ROLES.ADMIN;
export const isSuperAdmin = (role?: FleetRole | null): boolean => role === FLEET_ROLES.SUPER_ADMIN;
export const isPlatformAdmin = (role?: FleetRole | null): boolean =>
    role === FLEET_ROLES.ADMIN || role === FLEET_ROLES.SUPER_ADMIN;

/** Capacités UI : mêmes écrans, actions / données différentes. */
export const canCreateFleets = (role?: FleetRole | null): boolean => isPlatformAdmin(role);
export const canMutateFleets = (role?: FleetRole | null): boolean => isPlatformAdmin(role);
export const canCreateVehicles = (role?: FleetRole | null): boolean =>
    isManager(role) || isPlatformAdmin(role);
export const canCreateDrivers = (role?: FleetRole | null): boolean =>
    isManager(role) || isPlatformAdmin(role);
export const canManageManagers = (role?: FleetRole | null): boolean => isPlatformAdmin(role);
export const canOperateTrips = (role?: FleetRole | null): boolean =>
    isManager(role) || isAdmin(role) || isSuperAdmin(role);

export const roleLabelKey = (role?: FleetRole | null): string => {
    switch (role) {
        case FLEET_ROLES.SUPER_ADMIN:
            return 'roles.superAdmin';
        case FLEET_ROLES.ADMIN:
            return 'roles.admin';
        case FLEET_ROLES.MANAGER:
            return 'roles.manager';
        case FLEET_ROLES.DRIVER:
            return 'roles.driver';
        default:
            return 'roles.unknown';
    }
};

export const areaForRole = (role?: FleetRole | null): 'driver' | 'manager' | 'admin' => {
    if (isDriver(role)) return 'driver';
    if (isPlatformAdmin(role)) return 'admin';
    return 'manager';
};

export const homeRouteForRole = (
    role?: FleetRole | null
): '/driver/home' | '/manager/home' | '/admin/home' => {
    const area = areaForRole(role);
    if (area === 'driver') return '/driver/home';
    if (area === 'admin') return '/admin/home';
    return '/manager/home';
};

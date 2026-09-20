import { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    canCreateDrivers,
    canCreateFleets,
    canCreateVehicles,
    canManageManagers,
    canMutateFleets,
    canOperateTrips,
    isAdmin,
    isDriver,
    isManager,
    isPlatformAdmin,
    isSuperAdmin,
    resolveFleetRole,
    type FleetRole,
    type RoleBearer,
} from '../api/roles';

export function useFleetRole() {
    const [role, setRole] = useState<FleetRole | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const raw = await AsyncStorage.getItem('user');
                const user = raw ? (JSON.parse(raw) as RoleBearer) : null;
                if (!cancelled) setRole(resolveFleetRole(user));
            } catch {
                if (!cancelled) setRole(null);
            } finally {
                if (!cancelled) setReady(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return useMemo(
        () => ({
            role,
            ready,
            isDriver: isDriver(role),
            isManager: isManager(role),
            isAdmin: isAdmin(role),
            isSuperAdmin: isSuperAdmin(role),
            isPlatformAdmin: isPlatformAdmin(role),
            canCreateFleets: canCreateFleets(role),
            canMutateFleets: canMutateFleets(role),
            canCreateVehicles: canCreateVehicles(role),
            canCreateDrivers: canCreateDrivers(role),
            canManageManagers: canManageManagers(role),
            canOperateTrips: canOperateTrips(role),
        }),
        [role, ready]
    );
}

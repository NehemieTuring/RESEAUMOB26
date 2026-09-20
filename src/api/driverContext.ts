import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from './authService';
import { DriverService, type Driver } from './driverService';
import { VehicleService, type Vehicle } from './vehicleService';
import { TripService, type Trip } from './tripService';

const UI_USER_KEY = 'user';
const KERNEL_USER_KEY = '@fleetman_user_data';

export interface DriverWorkspace {
    driverId: string;
    vehicleId: string | null;
    vehicle: Vehicle | null;
    driver: Driver | null;
    activeTrip: Trip | null;
}

const readStoredUser = async (): Promise<any | null> => {
    const [uiRaw, kernelRaw] = await Promise.all([
        AsyncStorage.getItem(UI_USER_KEY),
        AsyncStorage.getItem(KERNEL_USER_KEY),
    ]);
    const ui = uiRaw ? JSON.parse(uiRaw) : null;
    const kernel = kernelRaw ? JSON.parse(kernelRaw) : null;
    return { ...kernel, ...ui };
};

const persistVehicleId = async (vehicleId: string | null) => {
    for (const key of [UI_USER_KEY, KERNEL_USER_KEY]) {
        const raw = await AsyncStorage.getItem(key);
        if (!raw) continue;
        const data = JSON.parse(raw);
        data.vehicleId = vehicleId;
        await AsyncStorage.setItem(key, JSON.stringify(data));
    }
};

export const resolveDriverWorkspace = async (): Promise<DriverWorkspace> => {
    const user = await readStoredUser();
    const driverId = String(user?.userUuid || user?.id || user?.userId || '');

    let vehicleId: string | null = user?.vehicleId ?? null;
    let driver: Driver | null = null;

    try {
        const me = await AuthService.getMe();
        if (me?.vehicleId) vehicleId = me.vehicleId;
    } catch {
        /* session locale déjà chargée */
    }

    if (driverId && driverId !== '0' && driverId !== 'guest') {
        try {
            driver = await DriverService.getById(driverId);
            if (driver?.assignedVehicleId) {
                vehicleId = driver.assignedVehicleId;
            }
        } catch {
            /* getMe a déjà fourni l'assignation */
        }
    }

    let vehicle: Vehicle | null = null;
    if (vehicleId) {
        try {
            vehicle = await VehicleService.getById(vehicleId);
        } catch {
            vehicle = null;
        }
    }

    let activeTrip: Trip | null = null;
    try {
        activeTrip = await TripService.myActive();
    } catch {
        activeTrip = null;
    }

    await persistVehicleId(vehicleId);
    return { driverId, vehicleId, vehicle, driver, activeTrip };
};

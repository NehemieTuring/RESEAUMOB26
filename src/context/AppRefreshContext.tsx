import React, { useEffect } from 'react';
import { AppState, type AppStateStatus, DeviceEventEmitter } from 'react-native';

export const APP_SILENT_REFRESH = 'appSilentRefresh';
export const APP_REFRESH_INTERVAL_MS = 10_000;

/**
 * Horloge unique de l'application : émet un tick toutes les 10 s
 * uniquement quand l'app est au premier plan.
 */
export function AppRefreshProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        let appState: AppStateStatus = AppState.currentState;
        const appSub = AppState.addEventListener('change', (next) => {
            appState = next;
        });

        const id = setInterval(() => {
            if (appState === 'active') {
                DeviceEventEmitter.emit(APP_SILENT_REFRESH);
            }
        }, APP_REFRESH_INTERVAL_MS);

        return () => {
            clearInterval(id);
            appSub.remove();
        };
    }, []);

    return <>{children}</>;
}

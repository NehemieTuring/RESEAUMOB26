import { useEffect, useRef } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { APP_SILENT_REFRESH } from '../context/AppRefreshContext';

/**
 * Relance `callback` à chaque tick global (10 s) sans indicateur visuel.
 * N'agit que si l'écran est au premier plan. Ignore un cycle si l'appel précédent n'est pas terminé.
 */
export function useSilentRefresh(callback?: (() => unknown) | null, enabled = true) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;
    const inFlight = useRef(false);
    const focused = useIsFocused();

    useEffect(() => {
        if (!enabled) return undefined;

        const sub = DeviceEventEmitter.addListener(APP_SILENT_REFRESH, () => {
            if (!focused || inFlight.current) return;
            const fn = callbackRef.current;
            if (!fn) return;
            inFlight.current = true;
            Promise.resolve(fn())
                .catch(() => undefined)
                .finally(() => {
                    inFlight.current = false;
                });
        });

        return () => sub.remove();
    }, [enabled, focused]);
}

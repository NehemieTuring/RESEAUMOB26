import { Redirect, useLocalSearchParams } from 'expo-router';
import { useFleetRole } from '../../src/hooks/useFleetRole';
import { areaForRole } from '../../src/api/roles';

/** Alias `/tabs/vehicles` → `/manager/vehicles` ou `/admin/vehicles`. */
export default function TabsPathAlias() {
    const { role, ready } = useFleetRole();
    const { rest } = useLocalSearchParams<{ rest?: string | string[] }>();
    if (!ready) return null;
    const parts = Array.isArray(rest) ? rest : rest ? [rest] : ['home'];
    const area = areaForRole(role);
    return <Redirect href={`/${area}/${parts.join('/')}` as any} />;
}

import { Redirect } from 'expo-router';
import { useFleetRole } from '../../src/hooks/useFleetRole';
import { homeRouteForRole } from '../../src/api/roles';

export default function TabsIndexAlias() {
    const { role, ready } = useFleetRole();
    if (!ready) return null;
    return <Redirect href={homeRouteForRole(role)} />;
}

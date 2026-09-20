import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useFleetRole } from '../src/hooks/useFleetRole';
import { homeRouteForRole } from '../src/api/roles';
import { useTheme } from '../src/context/ThemeContext';

/** Ancien `/home` → dashboard du rôle courant. */
export default function HomeAlias() {
    const { role, ready } = useFleetRole();
    const { colors } = useTheme();

    if (!ready) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primaryDark }}>
                <ActivityIndicator color={colors.primaryBlue} />
            </View>
        );
    }

    return <Redirect href={homeRouteForRole(role)} />;
}

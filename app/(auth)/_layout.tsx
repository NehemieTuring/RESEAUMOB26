/**
 * FleetMan Mobile - Auth Layout
 * Layout for authentication screens
 */

import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';

export default function AuthLayout() {
    const { colors, isDarkMode } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                headerStyle: {
                    backgroundColor: colors.primaryDark,
                },
                headerTintColor: colors.textPrimary,
                headerTitleStyle: {
                    fontWeight: '600',
                },
                headerShadowVisible: false,
                contentStyle: {
                    backgroundColor: colors.primaryDark,
                },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen
                name="login"
                options={{
                    title: 'Connexion',
                    headerShown: false, // We usually use custom headers or dynamic ones
                }}
            />
            <Stack.Screen
                name="register"
                options={{
                    title: 'Inscription',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="terms"
                options={{
                    title: 'Conditions',
                    headerShown: false,
                }}
            />
        </Stack>
    );
}

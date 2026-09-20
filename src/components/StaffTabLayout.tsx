import { View, Text, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

type Variant = 'manager' | 'admin';

const HIDDEN = [
    'trips',
    'incidents',
    'map',
    'subscription',
    'support',
    'history',
    'reports',
    'zones',
    'notifications',
    'settings',
] as const;

export function StaffTabLayout({ variant }: { variant: Variant }) {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const isAdmin = variant === 'admin';

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.primaryCyan,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.navBg,
                    borderTopColor: colors.borderGlass,
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? 96 : 84,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
                    paddingTop: 8,
                    elevation: 0,
                    shadowOpacity: 0,
                    overflow: 'visible',
                },
                tabBarItemStyle: {
                    paddingTop: 2,
                    overflow: 'visible',
                },
                tabBarIconStyle: {
                    width: 40,
                    height: 40,
                    marginBottom: 0,
                },
                tabBarLabel: ({ color, children }) => (
                    <Text numberOfLines={1} style={[styles.tabLabel, { color }]}>
                        {children}
                    </Text>
                ),
                headerShown: false,
                headerShadowVisible: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="home"
                options={{
                    title: t('navigation.home'),
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} colors={colors} />
                    ),
                }}
            />
            <Tabs.Screen
                name="fleets"
                options={{
                    title: t('navigation.fleets'),
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name={focused ? 'grid' : 'grid-outline'} color={color} focused={focused} colors={colors} />
                    ),
                }}
            />
            <Tabs.Screen
                name="vehicles"
                options={{
                    title: t('navigation.vehicles'),
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name={focused ? 'car' : 'car-outline'} color={color} focused={focused} colors={colors} />
                    ),
                }}
            />
            <Tabs.Screen
                name="drivers"
                options={{
                    title: t('navigation.drivers'),
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name={focused ? 'people' : 'people-outline'} color={color} focused={focused} colors={colors} />
                    ),
                }}
            />
            {isAdmin ? (
                <Tabs.Screen
                    name="managers"
                    options={{
                        href: null,
                        title: t('navigation.managers'),
                    }}
                />
            ) : null}
            <Tabs.Screen
                name="more"
                options={{
                    title: t('navigation.more'),
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name={focused ? 'menu' : 'menu-outline'} color={color} focused={focused} colors={colors} />
                    ),
                }}
            />
            {HIDDEN.map((name) => (
                <Tabs.Screen
                    key={name}
                    name={name}
                    options={{ href: null, headerShown: false }}
                />
            ))}
        </Tabs>
    );
}

function TabIcon({
    name,
    color,
    focused,
    colors,
}: {
    name: keyof typeof Ionicons.glyphMap;
    color: string;
    focused: boolean;
    colors: { primaryBlue: string; primaryCyan: string; white: string };
}) {
    if (focused) {
        return (
            <View style={styles.activeIconContainer}>
                <LinearGradient
                    colors={[colors.primaryBlue, colors.primaryCyan]}
                    style={styles.activeIconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Ionicons name={name} size={22} color={colors.white} />
                </LinearGradient>
            </View>
        );
    }
    return <Ionicons name={name} size={24} color={color} />;
}

const styles = StyleSheet.create({
    activeIconContainer: { alignItems: 'center', justifyContent: 'center' },
    activeIconGradient: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 4,
        width: '100%',
        paddingHorizontal: 2,
    },
});

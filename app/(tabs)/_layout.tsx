/**
 * FleetMan Mobile - Dashboard Tab Layout
 * Bottom tabs with theme support
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primaryCyan,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.navBg,
          borderTopColor: colors.borderGlass,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 75,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -4,
        },
        headerStyle: {
          backgroundColor: colors.navBg,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderGlass,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('navigation.home'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="fleets"
        options={{
          title: t('navigation.fleets'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'grid' : 'grid-outline'} color={color} focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: t('navigation.vehicles'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'car' : 'car-outline'} color={color} focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="drivers"
        options={{
          title: t('navigation.drivers'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'people' : 'people-outline'} color={color} focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('navigation.more'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'menu' : 'menu-outline'} color={color} focused={focused} colors={colors} />
          ),
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen name="trips" options={{ href: null, title: 'Trajets', headerShown: false }} />
      <Tabs.Screen name="managers" options={{ href: null, title: t('navigation.managers'), headerShown: false }} />
      <Tabs.Screen name="incidents" options={{ href: null, title: t('navigation.incidents'), headerShown: false }} />
      <Tabs.Screen name="map" options={{ href: null, title: t('navigation.map'), headerShown: false }} />
      <Tabs.Screen name="subscription" options={{ href: null, title: t('navigation.subscription'), headerShown: false }} />
      <Tabs.Screen name="support" options={{ href: null, title: t('navigation.support'), headerShown: false }} />
      <Tabs.Screen name="history" options={{ href: null, title: t('navigation.history'), headerShown: false }} />
      <Tabs.Screen name="reports" options={{ href: null, title: t('navigation.reports'), headerShown: false }} />
      <Tabs.Screen name="zones" options={{ href: null, title: t('navigation.zones'), headerShown: false }} />
      <Tabs.Screen name="notifications" options={{ href: null, title: 'Notifications', headerShown: false }} />
      <Tabs.Screen name="settings" options={{ href: null, title: t('navigation.settings'), headerShown: false }} />
    </Tabs>
  );
}

function TabIcon({
  name,
  color,
  focused,
  colors
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
  colors: any;
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
  activeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -6,
    marginBottom: 2,
  },
});

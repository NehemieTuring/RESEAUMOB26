/**
 * FleetMan Mobile - Driver Tab Layout
 * Bottom tabs for the driver role
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function DriverTabLayout() {
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
          title: t('navigation.home') || 'Accueil',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="vehicle"
        options={{
          title: t('driverNav.myVehicle'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'car' : 'car-outline'} color={color} focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: t('driverNav.myTrips'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'map' : 'map-outline'} color={color} focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="fuel"
        options={{
          title: t('driverNav.fuel'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'water' : 'water-outline'} color={color} focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('navigation.more') || 'Plus',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'menu' : 'menu-outline'} color={color} focused={focused} colors={colors} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="incidents"
        options={{
          title: t('driverNav.incidents') || 'Incidents',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'warning' : 'warning-outline'} color={color} focused={focused} colors={colors} />
          ),
        }}
      />
      
      {/* Hidden screens in the stack */}
      <Tabs.Screen name="map" options={{ href: null, title: t('driverNav.gps'), headerShown: false }} />
      <Tabs.Screen name="notifications" options={{ href: null, title: t('driverNav.notifications'), headerShown: false }} />
      <Tabs.Screen name="statistics" options={{ href: null, title: t('driverNav.statistics'), headerShown: false }} />
      <Tabs.Screen name="support" options={{ href: null, title: t('driverNav.assistance'), headerShown: false }} />
      <Tabs.Screen name="profile" options={{ href: null, title: t('driverNav.profile'), headerShown: false }} />
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

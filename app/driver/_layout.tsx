/**
 * FleetMan Mobile - Driver Tab Layout
 * Bottom tabs for the driver role
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
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
        name="index"
        options={{ href: null }}
      />
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
        name="incidents"
        options={{
          title: t('driverNav.incidents') || 'Incidents',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'warning' : 'warning-outline'} color={color} focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('driverNav.profile') || 'Profil',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} color={color} focused={focused} colors={colors} />
          ),
        }}
      />

      {/* Hidden screens */}
      <Tabs.Screen name="map" options={{ href: null, title: t('driverNav.gps'), headerShown: false }} />
      <Tabs.Screen name="notifications" options={{ href: null, title: t('driverNav.notifications'), headerShown: false }} />
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

/**
 * FleetMan Mobile - Root Layout
 * Global configuration with Stack navigation and theme provider
 */

import { useEffect, useState } from 'react';
import { StatusBar, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { DarkColors, LightColors } from '../src/constants/Colors';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { ToastProvider } from '../src/context/ToastContext';
import { detectApiUrl } from '../src/constants/Config';
import apiClient from '../src/services/api';
import { restoreSession } from '../src/services/authApi';
import '../src/i18n'; // Initialize i18n
import { loadSavedLanguage } from '../src/i18n';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Custom themes matching FleetMan design
const FleetManDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: DarkColors.primaryBlue,
    background: DarkColors.primaryDark,
    card: DarkColors.surfaceCard,
    text: DarkColors.textPrimary,
    border: DarkColors.borderGlass,
    notification: DarkColors.accentOrange,
  },
};

const FleetManLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: LightColors.primaryBlue,
    background: LightColors.primaryDark,
    card: LightColors.surfaceCard,
    text: LightColors.textPrimary,
    border: LightColors.borderGlass,
    notification: LightColors.accentOrange,
  },
};

function RootLayoutNav() {
  const { isDarkMode, colors } = useTheme();
  const navigationTheme = isDarkMode ? FleetManDarkTheme : FleetManLightTheme;

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.primaryDark}
      />
      <NavigationThemeProvider value={navigationTheme}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.navBg,
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
            name="index"
            options={{
              headerShown: false,
              title: 'FleetMan',
            }}
          />
          <Stack.Screen
            name="(auth)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(driver)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="profile"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="+not-found"
            options={{
              title: 'Page non trouvée',
              presentation: 'modal',
            }}
          />
        </Stack>
      </NavigationThemeProvider>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Configure API
      detectApiUrl().then(url => {
        apiClient.setBaseUrl(url);
      });

      // Restaure le JWT persiste pour que les appels suivants soient authentifies.
      restoreSession();

      // Load saved language preference
      loadSavedLanguage();
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <RootLayoutNav />
      </ToastProvider>
    </ThemeProvider>
  );
}

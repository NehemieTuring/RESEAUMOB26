/**
 * FleetMan Mobile - Theme Context
 * Provides theme switching functionality across the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkColors, LightColors, ThemeColors } from '../constants/Colors';

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
    isDarkMode: boolean;
    themeMode: ThemeMode;
    colors: ThemeColors;
    toggleTheme: () => void;
    setThemeMode: (mode: ThemeMode) => void;
    notificationsEnabled: boolean;
    toggleNotifications: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@fleetman_theme_mode';
const NOTIFICATIONS_STORAGE_KEY = '@fleetman_notifications_enabled';

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

    // Calculate if dark mode based on themeMode and system preference
    const isDarkMode = themeMode === 'system'
        ? systemColorScheme === 'dark'
        : themeMode === 'dark';

    // Get the appropriate colors
    const colors = isDarkMode ? DarkColors : LightColors;

    // Load saved preferences on mount
    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const [savedMode, savedNotifs] = await Promise.all([
                AsyncStorage.getItem(THEME_STORAGE_KEY),
                AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
            ]);

            if (savedMode && ['dark', 'light', 'system'].includes(savedMode)) {
                setThemeModeState(savedMode as ThemeMode);
            }

            if (savedNotifs !== null) {
                setNotificationsEnabled(savedNotifs === 'true');
            }
        } catch (error) {
            console.log('Error loading preferences:', error);
        } finally {
            setIsLoaded(true);
        }
    };

    const saveThemePreference = async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch (error) {
            console.log('Error saving theme preference:', error);
        }
    };

    const saveNotificationsPreference = async (enabled: boolean) => {
        try {
            await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, String(enabled));
        } catch (error) {
            console.log('Error saving notifications preference:', error);
        }
    };

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
        saveThemePreference(mode);
    };

    const toggleTheme = () => {
        const newMode = isDarkMode ? 'light' : 'dark';
        setThemeMode(newMode);
    };

    const toggleNotifications = () => {
        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);
        saveNotificationsPreference(newValue);
    };

    const value: ThemeContextType = {
        isDarkMode,
        themeMode,
        colors,
        toggleTheme,
        setThemeMode,
        notificationsEnabled,
        toggleNotifications,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export default ThemeContext;

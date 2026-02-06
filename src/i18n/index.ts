/**
 * FleetMan Mobile - i18n Configuration
 * Internationalization setup with French and English
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import fr from './locales/fr.json';
import en from './locales/en.json';

const LANGUAGE_STORAGE_KEY = '@fleetman_language';

// Language resources
const resources = {
    fr: { translation: fr },
    en: { translation: en },
};

// Initialize i18n
i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'fr', // Default language
        fallbackLng: 'fr',
        compatibilityJSON: 'v4',
        interpolation: {
            escapeValue: false, // React already escapes values
        },
        react: {
            useSuspense: false,
        },
    });

// Load saved language preference
export const loadSavedLanguage = async () => {
    try {
        const savedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLang && ['fr', 'en'].includes(savedLang)) {
            i18n.changeLanguage(savedLang);
        }
    } catch (error) {
        console.log('Error loading language:', error);
    }
};

// Save language preference
export const saveLanguage = async (lang: string) => {
    try {
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
        console.log('Error saving language:', error);
    }
};

// Change language and save
export const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    await saveLanguage(lang);
};

// Available languages
export const AVAILABLE_LANGUAGES = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
];

export default i18n;

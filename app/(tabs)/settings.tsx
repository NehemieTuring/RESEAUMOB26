/**
 * FleetMan Mobile - Settings Screen
 * App settings page with theme and i18n support
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { DashboardHeader } from '../../src/components';
import { changeLanguage, AVAILABLE_LANGUAGES } from '../../src/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';

export default function SettingsScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { colors, isDarkMode, toggleTheme, notificationsEnabled, toggleNotifications } = useTheme();
    const currentLanguage = i18n.language || 'fr';
    const [updateAvailable, setUpdateAvailable] = React.useState(false);
    const [isCheckingUpdate, setIsCheckingUpdate] = React.useState(false);

    React.useEffect(() => {
        const checkUpdate = async () => {
            try {
                const update = await Updates.checkForUpdateAsync();
                if (update.isAvailable) {
                    setUpdateAvailable(true);
                }
            } catch (error) {
                console.log('Error checking for updates:', error);
            }
        };
        // Only run in production/build mode, checking updates in DEV usually errors
        if (!__DEV__) {
            checkUpdate();
        }
    }, []);

    const handleUpdateApp = async () => {
        if (!updateAvailable) {
            Alert.alert(t('settings.upToDate'), t('settings.upToDateMessage'));
            return;
        }
        try {
            setIsCheckingUpdate(true);
            await Updates.fetchUpdateAsync();
            Alert.alert(
                t('settings.updateReady'),
                t('settings.updateReadyMessage'),
                [{ text: "OK", onPress: () => Updates.reloadAsync() }]
            );
        } catch (error) {
            Alert.alert(t('common.error'), t('settings.updateError'));
            console.error(error);
        } finally {
            setIsCheckingUpdate(false);
        }
    };

    const handleLanguageChange = async () => {
        const newLang = currentLanguage === 'fr' ? 'en' : 'fr';
        await changeLanguage(newLang);
        const lang = AVAILABLE_LANGUAGES.find(l => l.code === newLang);
        Alert.alert(t('language.changed'), `${lang?.flag} ${lang?.name}`);
    };

    const settingsSections = [
        {
            title: t('settings.preferences'),
            items: [
                { id: 'theme', icon: isDarkMode ? 'moon' : 'sunny', label: isDarkMode ? t('theme.darkMode') : t('theme.lightMode'), type: 'switch', value: isDarkMode, onToggle: toggleTheme },
                { id: 'language', icon: 'globe', label: t('language.title'), value: AVAILABLE_LANGUAGES.find(l => l.code === currentLanguage)?.name, onPress: handleLanguageChange },
            ],
        },
        {
            title: t('settings.aboutSystem'),
            items: [
                { 
                    id: 'update', 
                    icon: 'cloud-download', 
                    label: updateAvailable ? t('settings.newUpdate') : t('settings.checkUpdates'), 
                    onPress: handleUpdateApp,
                    isSuccess: updateAvailable,
                    isDestructive: false,
                    isNeutral: !updateAvailable
                },
                { id: 'version', icon: 'information-circle', label: t('settings.version'), value: '1.0.0' },
            ],
        },
    ];

    React.useEffect(() => {
        console.log('[Settings] Screen mounted');
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryDark }]} edges={['top']}>
            {isDarkMode && (
                <LinearGradient
                    colors={[colors.primaryDark, '#0f172a', colors.primaryDark]}
                    style={StyleSheet.absoluteFillObject}
                />
            )}

            {/* Dashboard Header */}
            <DashboardHeader showSearch={false} />

            <View style={styles.header}>
                <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>{t('navigation.settings')}</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {settingsSections.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{section.title}</Text>
                        <View style={[styles.sectionContent, {
                            backgroundColor: colors.surfaceCard,
                            borderColor: colors.borderGlass,
                        }]}>
                            {section.items.map((item: any, itemIndex: number) => {
                                const isSwitch = 'type' in item && item.type === 'switch';
                                const hasValue = 'value' in item && item.value !== undefined;
                                const switchValue = isSwitch && typeof item.value === 'boolean' ? item.value : false;
                                const onToggle = 'onToggle' in item ? item.onToggle : undefined;

                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[
                                            styles.settingItem,
                                            itemIndex < section.items.length - 1 && [
                                                styles.settingItemBorder,
                                                { borderBottomColor: colors.borderGlass }
                                            ],
                                        ]}
                                        onPress={'onPress' in item ? item.onPress : undefined}
                                        disabled={isSwitch}
                                        activeOpacity={isSwitch ? 1 : 0.7}
                                    >
                                        <View style={[styles.iconContainer, {
                                            backgroundColor: item.isDestructive ? colors.errorBg + '40' : 
                                                           item.isSuccess ? '#10b98120' : 
                                                           item.isNeutral ? colors.textMuted + '20' :
                                                           colors.primaryBlue + '20'
                                        }]}>
                                            <Ionicons
                                                name={item.icon as any}
                                                size={20}
                                                color={item.isDestructive ? colors.errorText : 
                                                       item.isSuccess ? '#10b981' : 
                                                       item.isNeutral ? colors.textMuted :
                                                       colors.primaryBlue}
                                            />
                                        </View>
                                        <Text style={[
                                            styles.settingLabel,
                                            { color: item.isDestructive ? colors.errorText : 
                                                     item.isSuccess ? '#10b981' : 
                                                     item.isNeutral ? colors.textSecondary :
                                                     colors.textPrimary }
                                        ]}>
                                            {item.label}
                                        </Text>
                                        {isSwitch ? (
                                            <Switch
                                                value={switchValue}
                                                onValueChange={onToggle}
                                                trackColor={{ false: colors.surfaceGlass, true: colors.primaryBlue + '60' }}
                                                thumbColor={switchValue ? colors.primaryBlue : colors.textMuted}
                                            />
                                        ) : hasValue ? (
                                            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{String(item.value)}</Text>
                                        ) : (
                                            <Ionicons
                                                name="chevron-forward"
                                                size={20}
                                                color={item.isDestructive ? colors.errorText : colors.textMuted}
                                            />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 16, paddingTop: 8 },
    pageTitle: { fontSize: 24, fontWeight: '700' },
    scrollView: { flex: 1 },
    scrollContent: { padding: 16, paddingTop: 0, paddingBottom: 50 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
    sectionContent: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
    settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    settingItemBorder: { borderBottomWidth: 1 },
    iconContainer: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    settingLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
    settingValue: { fontSize: 14 },
});

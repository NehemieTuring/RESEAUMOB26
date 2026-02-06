/**
 * FleetMan Mobile - Page Header Component
 * Provides theme toggle, language toggle and back button
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';

const { width: screenWidth } = Dimensions.get('window');

interface PageHeaderProps {
    showBackButton?: boolean;
    transparent?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    showBackButton = true,
    transparent = true
}) => {
    const router = useRouter();
    const { colors, isDarkMode, toggleTheme } = useTheme();
    const { i18n } = useTranslation();

    const currentLanguage = i18n.language.split('-')[0].toUpperCase();

    const handleToggleLanguage = async () => {
        const nextLang = i18n.language.startsWith('fr') ? 'en' : 'fr';
        await changeLanguage(nextLang);
    };

    // Responsive button sizes based on screen width
    const buttonSize = Math.min(40, screenWidth * 0.1);
    const iconSize = Math.min(18, buttonSize * 0.45);

    return (
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
            <View style={[
                styles.headerContainer,
                !transparent && { backgroundColor: colors.navBg }
            ]}>
                <View style={styles.leftSection}>
                    {showBackButton && (
                        <TouchableOpacity
                            style={[
                                styles.iconButton,
                                {
                                    backgroundColor: colors.surfaceCard,
                                    borderColor: colors.borderGlass,
                                    width: buttonSize,
                                    height: buttonSize,
                                    borderRadius: buttonSize / 2,
                                }
                            ]}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={iconSize} color={colors.textPrimary} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.rightSection}>
                    {/* Theme Toggle */}
                    <TouchableOpacity
                        style={[
                            styles.themeButton,
                            {
                                backgroundColor: colors.surfaceCard,
                                borderColor: colors.borderGlass,
                                width: buttonSize,
                                height: buttonSize,
                                borderRadius: buttonSize / 2,
                            }
                        ]}
                        onPress={toggleTheme}
                    >
                        <Ionicons
                            name={isDarkMode ? "sunny" : "moon"}
                            size={iconSize}
                            color={isDarkMode ? colors.accentOrange : colors.primaryBlue}
                        />
                    </TouchableOpacity>

                    {/* Language Toggle */}
                    <TouchableOpacity
                        style={[
                            styles.languageButton,
                            {
                                backgroundColor: colors.surfaceCard,
                                borderColor: colors.borderGlass,
                                height: buttonSize,
                                borderRadius: buttonSize / 2,
                                paddingHorizontal: Math.max(10, buttonSize * 0.3),
                            }
                        ]}
                        onPress={handleToggleLanguage}
                    >
                        <Ionicons name="globe-outline" size={iconSize} color={colors.textPrimary} />
                        <Text style={[
                            styles.languageText,
                            {
                                color: colors.textPrimary,
                                fontSize: Math.min(12, buttonSize * 0.3),
                            }
                        ]}>
                            {currentLanguage}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        zIndex: 100,
        width: '100%',
    },
    leftSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
    },
    iconButton: {
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    themeButton: {
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    languageButton: {
        flexDirection: 'row',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    languageText: {
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});

export default PageHeader;

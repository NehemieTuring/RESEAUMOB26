/**
 * FleetMan Mobile - Logo Component
 * Logo with theme support
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface LogoProps {
    size?: 'small' | 'medium' | 'large';
    showText?: boolean;
    style?: ViewStyle;
}

export const Logo: React.FC<LogoProps> = ({
    size = 'medium',
    showText = true,
    style,
}) => {
    const { colors } = useTheme();

    const getSize = () => {
        switch (size) {
            case 'small': return { icon: 24, text: 18 };
            case 'large': return { icon: 48, text: 32 };
            default: return { icon: 36, text: 24 };
        }
    };

    const dimensions = getSize();

    return (
        <View style={[styles.container, style]}>
            <View style={[
                styles.iconContainer,
                {
                    width: dimensions.icon + 16,
                    height: dimensions.icon + 16,
                    backgroundColor: colors.primaryBlue + '20',
                }
            ]}>
                <Ionicons name="car-sport" size={dimensions.icon} color={colors.primaryCyan} />
            </View>
            {showText && (
                <Text style={[
                    styles.text,
                    {
                        fontSize: dimensions.text,
                        color: colors.textPrimary,
                    }
                ]}>
                    <Text style={{ color: colors.primaryCyan }}>Fleet</Text>
                    <Text style={{ color: colors.primaryBlue }}>Man</Text>
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '700',
    },
});

export default Logo;

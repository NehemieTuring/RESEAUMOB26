/**
 * FleetMan Mobile - Button Component
 * Reusable button with theme support
 */

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle | ViewStyle[];
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    textStyle,
    icon,
}) => {
    const { colors } = useTheme();

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return { paddingVertical: 8, paddingHorizontal: 16 };
            case 'large':
                return { paddingVertical: 18, paddingHorizontal: 32 };
            default:
                return { paddingVertical: 14, paddingHorizontal: 24 };
        }
    };

    const getVariantStyles = (): ViewStyle => {
        switch (variant) {
            case 'secondary':
                return {
                    backgroundColor: colors.surfaceCard,
                    borderWidth: 1,
                    borderColor: colors.borderGlass,
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: colors.primaryBlue,
                };
            case 'ghost':
                return {
                    backgroundColor: 'transparent',
                };
            case 'gradient':
            case 'primary':
            default:
                return {
                    backgroundColor: colors.primaryBlue,
                };
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case 'secondary':
            case 'ghost':
                return colors.textPrimary;
            case 'outline':
                return colors.primaryBlue;
            default:
                return colors.white;
        }
    };

    const buttonContent = (
        <>
            {loading ? (
                <ActivityIndicator color={getTextColor()} size="small" />
            ) : (
                <>
                    {icon}
                    <Text style={[
                        styles.text,
                        { color: getTextColor() },
                        size === 'small' && styles.textSmall,
                        size === 'large' && styles.textLarge,
                        textStyle,
                    ]}>
                        {title}
                    </Text>
                </>
            )}
        </>
    );

    if (variant === 'gradient' && !disabled) {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                activeOpacity={0.8}
                style={style}
            >
                <LinearGradient
                    colors={[colors.primaryBlue, colors.primaryCyan]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.button, getSizeStyles(), disabled && styles.disabled]}
                >
                    {buttonContent}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                styles.button,
                getSizeStyles(),
                getVariantStyles(),
                disabled && styles.disabled,
                style,
            ]}
        >
            {buttonContent}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
    textSmall: {
        fontSize: 14,
    },
    textLarge: {
        fontSize: 18,
    },
    disabled: {
        opacity: 0.5,
    },
});

export default Button;

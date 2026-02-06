/**
 * FleetMan Mobile - Card Component
 * Reusable card with theme support
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
    variant?: 'default' | 'glass' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    variant = 'default',
}) => {
    const { colors } = useTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return {
                    backgroundColor: colors.surfaceGlass,
                    borderColor: colors.borderGlass,
                };
            case 'elevated':
                return {
                    backgroundColor: colors.surfaceCard,
                    borderColor: colors.borderGlass,
                    shadowColor: colors.shadowMd,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                };
            default:
                return {
                    backgroundColor: colors.surfaceCard,
                    borderColor: colors.borderGlass,
                };
        }
    };

    return (
        <View style={[styles.card, getVariantStyles(), style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
    },
});

export default Card;

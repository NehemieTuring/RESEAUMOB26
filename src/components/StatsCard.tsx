/**
 * FleetMan Mobile - StatsCard Component
 * Stats card with theme support
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: string;
    trend?: number;
    trendLabel?: string;
    color?: string;
    style?: ViewStyle;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon,
    trend,
    trendLabel,
    color,
    style,
}) => {
    const { colors, isDarkMode } = useTheme();
    const accentColor = color || colors.primaryBlue;

    return (
        <View style={[
            styles.card,
            {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.borderGlass,
            },
            style
        ]}>
            <View style={styles.header}>
                {icon && (
                    <View style={[styles.iconContainer, { backgroundColor: accentColor + '20' }]}>
                        <Ionicons name={icon as any} size={20} color={accentColor} />
                    </View>
                )}
                {trend !== undefined && (
                    <View style={[
                        styles.trendBadge,
                        { backgroundColor: trend >= 0 ? colors.successBg : colors.errorBg }
                    ]}>
                        <Ionicons
                            name={trend >= 0 ? 'trending-up' : 'trending-down'}
                            size={12}
                            color={trend >= 0 ? colors.successText : colors.errorText}
                        />
                        <Text style={[
                            styles.trendText,
                            { color: trend >= 0 ? colors.successText : colors.errorText }
                        ]}>
                            {Math.abs(trend)}%
                        </Text>
                    </View>
                )}
            </View>
            <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
            <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
            {trendLabel && (
                <Text style={[styles.trendLabel, { color: colors.textMuted }]}>{trendLabel}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        minWidth: 140,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 2,
    },
    trendText: {
        fontSize: 11,
        fontWeight: '600',
    },
    value: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    title: {
        fontSize: 13,
        fontWeight: '500',
    },
    trendLabel: {
        fontSize: 11,
        marginTop: 4,
    },
});

export default StatsCard;

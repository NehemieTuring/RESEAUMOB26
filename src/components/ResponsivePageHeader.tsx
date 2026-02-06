/**
 * FleetMan Mobile - Responsive Page Header Component
 * Header with title and action button that wraps responsively
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

interface ResponsivePageHeaderProps {
    title: string;
    subtitle?: string;
    actionLabel?: string;
    actionIcon?: string;
    onActionPress?: () => void;
}

export const ResponsivePageHeader: React.FC<ResponsivePageHeaderProps> = ({
    title,
    subtitle,
    actionLabel,
    actionIcon = 'add',
    onActionPress,
}) => {
    const { colors } = useTheme();

    // Use column layout on very narrow screens
    const isNarrow = screenWidth < 380;

    return (
        <View style={[
            styles.container,
            isNarrow && styles.containerColumn
        ]}>
            <View style={styles.textContainer}>
                <Text
                    style={[styles.title, { color: colors.textPrimary }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                >
                    {title}
                </Text>
                {subtitle && (
                    <Text
                        style={[styles.subtitle, { color: colors.textSecondary }]}
                        numberOfLines={1}
                    >
                        {subtitle}
                    </Text>
                )}
            </View>

            {onActionPress && (
                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        { backgroundColor: colors.primaryBlue },
                        isNarrow && styles.actionButtonFull
                    ]}
                    onPress={onActionPress}
                >
                    <Ionicons name={actionIcon as any} size={18} color="#fff" />
                    {actionLabel && (
                        <Text style={styles.actionText} numberOfLines={1}>
                            {actionLabel}
                        </Text>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    containerColumn: {
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    textContainer: {
        flex: 1,
        minWidth: 0,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
        flexShrink: 0,
    },
    actionButtonFull: {
        justifyContent: 'center',
        marginTop: 8,
    },
    actionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default ResponsivePageHeader;

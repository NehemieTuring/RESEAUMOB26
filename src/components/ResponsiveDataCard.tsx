/**
 * FleetMan Mobile - Responsive Data Card Component
 * Modern card-based layout for mobile data display
 * Replaces table-based layouts for better mobile experience
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

export interface CardField {
    label: string;
    value: string | number | undefined | null;
    icon?: string;
    badge?: {
        text: string;
        color: string;
        bgColor: string;
    };
    highlight?: boolean;
}

export interface CardAction {
    icon: string;
    color?: string;
    onPress: () => void;
    label?: string;
}

interface ResponsiveDataCardProps {
    title: string;
    subtitle?: string;
    avatar?: {
        icon: string;
        color: string;
        bgColor: string;
    };
    fields: CardField[];
    actions?: CardAction[];
    onPress?: () => void;
    badge?: {
        text: string;
        color: string;
        bgColor: string;
    };
}

export const ResponsiveDataCard: React.FC<ResponsiveDataCardProps> = ({
    title,
    subtitle,
    avatar,
    fields,
    actions,
    onPress,
    badge,
}) => {
    const { colors, isDarkMode } = useTheme();

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: colors.surfaceCard,
                    borderColor: colors.borderGlass,
                    shadowColor: isDarkMode ? '#000' : colors.primaryBlue,
                }
            ]}
        >
            {/* Header Row */}
            <View style={styles.cardHeader}>
                {avatar && (
                    <View style={[styles.avatar, { backgroundColor: avatar.bgColor }]}>
                        <Ionicons name={avatar.icon as any} size={24} color={avatar.color} />
                    </View>
                )}
                <View style={styles.headerInfo}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
                            {title}
                        </Text>
                        {badge && (
                            <View style={[styles.badge, { backgroundColor: badge.bgColor }]}>
                                <Text style={[styles.badgeText, { color: badge.color }]}>
                                    {badge.text}
                                </Text>
                            </View>
                        )}
                    </View>
                    {subtitle && (
                        <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>



            {/* Actions Row */}
            {actions && actions.length > 0 && (
                <View style={[styles.actionsRow, { borderTopColor: colors.borderGlass }]}>
                    {actions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.actionButton, { backgroundColor: colors.surfaceGlass }]}
                            onPress={(e) => {
                                e.stopPropagation();
                                action.onPress();
                            }}
                        >
                            <Ionicons
                                name={action.icon as any}
                                size={18}
                                color={action.color || colors.textSecondary}
                            />
                            {action.label && (
                                <Text style={[styles.actionLabel, { color: action.color || colors.textSecondary }]}>
                                    {action.label}
                                </Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 10,
        borderWidth: 1,
        marginHorizontal: 8,
        marginVertical: 4,
        padding: 10,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    headerInfo: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        flex: 1,
    },
    subtitle: {
        fontSize: 11,
        marginTop: 1,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    fieldsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
        gap: 6,
    },
    fieldItem: {
        width: (screenWidth - 36) / 2 - 6,
        minWidth: 100,
        paddingVertical: 4,
        paddingHorizontal: 6,
        backgroundColor: 'rgba(148, 163, 184, 0.04)',
        borderRadius: 6,
    },
    fieldLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    fieldIcon: {
        marginRight: 4,
    },
    fieldLabel: {
        fontSize: 10,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.2,
    },
    fieldValue: {
        fontSize: 12,
        fontWeight: '600',
    },
    fieldBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginTop: 2,
    },
    fieldBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 6,
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default ResponsiveDataCard;

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
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: colors.surfaceCard,
                    borderColor: colors.borderGlass,
                    shadowColor: isDarkMode ? '#000' : colors.primaryBlue,
                }
            ]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
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

            {/* Fields Grid */}
            <View style={styles.fieldsContainer}>
                {fields.map((field, index) => (
                    <View key={index} style={styles.fieldItem}>
                        <View style={styles.fieldLabelRow}>
                            {field.icon && (
                                <Ionicons
                                    name={field.icon as any}
                                    size={12}
                                    color={colors.textMuted}
                                    style={styles.fieldIcon}
                                />
                            )}
                            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                                {field.label}
                            </Text>
                        </View>
                        {field.badge ? (
                            <View style={[styles.fieldBadge, { backgroundColor: field.badge.bgColor }]}>
                                <Text style={[styles.fieldBadgeText, { color: field.badge.color }]}>
                                    {field.badge.text}
                                </Text>
                            </View>
                        ) : (
                            <Text
                                style={[
                                    styles.fieldValue,
                                    { color: field.highlight ? colors.primaryBlue : colors.textPrimary }
                                ]}
                                numberOfLines={1}
                            >
                                {field.value || '-'}
                            </Text>
                        )}
                    </View>
                ))}
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
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 1,
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
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
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
    subtitle: {
        fontSize: 13,
        marginTop: 2,
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
        marginTop: 8,
        gap: 8,
    },
    fieldItem: {
        width: (screenWidth - 72) / 2 - 4,
        minWidth: 120,
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(148, 163, 184, 0.06)',
        borderRadius: 10,
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
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    fieldValue: {
        fontSize: 14,
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
        gap: 10,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 6,
    },
    actionLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
});

export default ResponsiveDataCard;

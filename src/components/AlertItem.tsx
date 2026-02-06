/**
 * FleetMan Mobile - AlertItem Component
 * Alert item with theme support
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface AlertItemProps {
    alert: {
        id: number;
        type: string;
        message: string;
        vehicleName?: string;
        timestamp: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
    };
    onPress?: () => void;
}

export const AlertItem: React.FC<AlertItemProps> = ({ alert, onPress }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const getSeverityColor = () => {
        switch (alert.severity) {
            case 'critical': return colors.errorText;
            case 'high': return colors.errorText;
            case 'medium': return colors.warningText;
            case 'low': return colors.infoText;
            default: return colors.textSecondary;
        }
    };

    const getSeverityBg = () => {
        switch (alert.severity) {
            case 'critical': return colors.errorBg;
            case 'high': return colors.errorBg;
            case 'medium': return colors.warningBg;
            case 'low': return colors.infoBg;
            default: return colors.surfaceGlass;
        }
    };

    const getAlertIcon = () => {
        switch (alert.type) {
            case 'SPEED': return 'speedometer';
            case 'GEOFENCE': return 'location';
            case 'MAINTENANCE': return 'construct';
            case 'FUEL': return 'water';
            case 'ACCIDENT': return 'warning';
            default: return 'alert-circle';
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, {
                backgroundColor: colors.surfaceCard,
                borderLeftColor: getSeverityColor(),
                borderColor: colors.borderGlass,
            }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: getSeverityBg() }]}>
                <Ionicons name={getAlertIcon()} size={20} color={getSeverityColor()} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.message, { color: colors.textPrimary }]} numberOfLines={2}>
                    {alert.message}
                </Text>
                {alert.vehicleName && (
                    <Text style={[styles.vehicle, { color: colors.textSecondary }]}>
                        {alert.vehicleName}
                    </Text>
                )}
                <Text style={[styles.time, { color: colors.textMuted }]}>
                    {alert.timestamp}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderLeftWidth: 3,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        marginLeft: 12,
    },
    message: {
        fontSize: 14,
        fontWeight: '500',
    },
    vehicle: {
        fontSize: 12,
        marginTop: 2,
    },
    time: {
        fontSize: 11,
        marginTop: 4,
    },
});

export default AlertItem;

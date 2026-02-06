/**
 * FleetMan Mobile - VehicleCard Component
 * Vehicle card with theme support
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface VehicleCardProps {
    vehicle: {
        vehicleId: number;
        vehicleName: string;
        vehicleMake: string;
        vehicleRegistrationNumber: string;
        vehicleType: string;
        vehicleImage?: string;
        vehicleFuelLevel?: number;
        vehicleSpeed?: number;
        state: string;
    };
    onPress?: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onPress }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const getStateColor = (state: string) => {
        switch (state) {
            case 'IN_SERVICE': return colors.successText;
            case 'PARKED': return colors.primaryBlue;
            case 'UNDER_MAINTENANCE': return colors.warningText;
            case 'OUT_OF_SERVICE': return colors.textMuted;
            case 'IN_ALARM': return colors.errorText;
            default: return colors.textSecondary;
        }
    };

    const getStateLabel = (state: string) => {
        switch (state) {
            case 'IN_SERVICE': return t('vehicles.status.active');
            case 'PARKED': return t('vehicles.status.stopped');
            case 'UNDER_MAINTENANCE': return t('vehicles.status.maintenance');
            case 'OUT_OF_SERVICE': return t('common.inactive');
            case 'IN_ALARM': return t('incidents.title');
            default: return state;
        }
    };

    const getVehicleIcon = (type: string) => {
        switch (type?.toUpperCase()) {
            case 'TRUCK': return 'bus';
            case 'MOTORCYCLE': return 'bicycle';
            case 'BUS': return 'bus';
            case 'VAN': return 'car-sport';
            default: return 'car';
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: colors.surfaceCard,
                    borderColor: colors.borderGlass,
                }
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primaryBlue + '20' }]}>
                    <Ionicons name={getVehicleIcon(vehicle.vehicleType)} size={24} color={colors.primaryBlue} />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={[styles.name, { color: colors.textPrimary }]}>
                        {vehicle.vehicleMake} {vehicle.vehicleName}
                    </Text>
                    <Text style={[styles.registration, { color: colors.textSecondary }]}>
                        {vehicle.vehicleRegistrationNumber}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStateColor(vehicle.state) + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStateColor(vehicle.state) }]} />
                    <Text style={[styles.statusText, { color: getStateColor(vehicle.state) }]}>
                        {getStateLabel(vehicle.state)}
                    </Text>
                </View>
            </View>

            <View style={[styles.details, { borderTopColor: colors.borderGlass }]}>
                <View style={styles.detailItem}>
                    <Ionicons name="speedometer-outline" size={16} color={colors.textMuted} />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {vehicle.vehicleSpeed || 0} km/h
                    </Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="water-outline" size={16} color={colors.textMuted} />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {vehicle.vehicleFuelLevel || 0}%
                    </Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="car-outline" size={16} color={colors.textMuted} />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {vehicle.vehicleType || 'N/A'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
    },
    registration: {
        fontSize: 13,
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 12,
        borderTopWidth: 1,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 12,
    },
});

export default VehicleCard;

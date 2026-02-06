/**
 * FleetMan Mobile - Backend Offline Banner Component
 * Shows when backend is not accessible
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface BackendOfflineBannerProps {
    message?: string;
    onRetry?: () => void;
    isRetrying?: boolean;
}

export const BackendOfflineBanner: React.FC<BackendOfflineBannerProps> = ({
    message = 'Serveur non disponible. Vérifiez que le backend est lancé.',
    onRetry,
    isRetrying = false,
}) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.errorBg || '#fef2f2', borderColor: colors.errorBorder || '#fecaca' }]}>
            <View style={styles.content}>
                <Ionicons name="cloud-offline" size={24} color={colors.errorText || '#dc2626'} />
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: colors.errorText || '#dc2626' }]}>
                        Connexion impossible
                    </Text>
                    <Text style={[styles.message, { color: colors.textSecondary }]}>
                        {message}
                    </Text>
                </View>
            </View>
            {onRetry && (
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: colors.errorText || '#dc2626' }]}
                    onPress={onRetry}
                    disabled={isRetrying}
                >
                    <Ionicons
                        name={isRetrying ? 'refresh' : 'refresh-outline'}
                        size={16}
                        color="#ffffff"
                        style={isRetrying ? styles.spinning : undefined}
                    />
                    <Text style={styles.retryText}>
                        {isRetrying ? 'Connexion...' : 'Réessayer'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    message: {
        fontSize: 13,
        lineHeight: 18,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6,
    },
    retryText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    spinning: {
        // Animation handled by React Native Animated if needed
    },
});

export default BackendOfflineBanner;

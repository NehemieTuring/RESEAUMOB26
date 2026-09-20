/**
 * Bandeau compact : le backend n'est pas joignable.
 * Informel, refermable — pas un bloc d'erreur technique.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

interface BackendOfflineBannerProps {
    message?: string;
    onRetry?: () => void;
    isRetrying?: boolean;
}

const looksTechnical = (raw: string): boolean => {
    const m = raw.toLowerCase();
    return (
        m.includes('http') ||
        m.includes('failed to fetch') ||
        m.includes('network') ||
        m.includes('abort') ||
        m.includes('econnrefused') ||
        m.includes('timeout') ||
        /\b(401|403|404|500|502|503)\b/.test(m)
    );
};

export const BackendOfflineBanner: React.FC<BackendOfflineBannerProps> = ({
    message,
    onRetry,
    isRetrying = false,
}) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [dismissed, setDismissed] = useState(false);

    const text = useMemo(() => {
        const raw = (message ?? '').trim();
        if (!raw || looksTechnical(raw)) {
            const lower = raw.toLowerCase();
            if (lower.includes('401') || lower.includes('403')) {
                return t('offlineBanner.auth');
            }
            if (/\b(500|502|503)\b/.test(lower)) {
                return t('offlineBanner.server');
            }
            return t('offlineBanner.message');
        }
        return raw;
    }, [message, t]);

    if (dismissed) return null;

    return (
        <View
            style={[
                styles.bar,
                {
                    backgroundColor: colors.warningBg,
                    borderColor: colors.warningBorder,
                },
            ]}
        >
            <Ionicons name="cloud-offline-outline" size={16} color={colors.warningText} />
            <Text style={[styles.text, { color: colors.textSecondary }]} numberOfLines={2}>
                {text}
            </Text>
            {onRetry && (
                <TouchableOpacity
                    onPress={onRetry}
                    disabled={isRetrying}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.action}
                >
                    <Text style={[styles.actionText, { color: colors.warningText }]}>
                        {isRetrying ? t('offlineBanner.retrying') : t('offlineBanner.retry')}
                    </Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity
                onPress={() => setDismissed(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel={t('common.close')}
            >
                <Ionicons name="close" size={16} color={colors.textMuted} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    text: {
        flex: 1,
        fontSize: 12,
        lineHeight: 16,
    },
    action: {
        paddingVertical: 2,
        paddingHorizontal: 4,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default BackendOfflineBanner;

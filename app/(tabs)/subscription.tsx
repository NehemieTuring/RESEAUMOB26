/**
 * FleetMan Mobile - Subscription Screen
 * Subscription plans with theme and i18n support
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { DashboardHeader } from '../../src/components/DashboardHeader';

export default function SubscriptionScreen() {
    const { t } = useTranslation();
    const { colors, isDarkMode } = useTheme();
    const [selectedPlan, setSelectedPlan] = useState('professional');

    const plans = [
        {
            id: 'basic',
            name: t('subscription.basic.name'),
            price: t('subscription.basic.price'),
            period: t('subscription.basic.period'),
            features: [
                '5 vehicles',
                '2 drivers',
                'Basic tracking',
                'Email support',
            ],
            color: colors.textSecondary,
        },
        {
            id: 'professional',
            name: t('subscription.professional.name'),
            price: t('subscription.professional.price'),
            period: t('subscription.professional.period'),
            features: [
                '25 vehicles',
                '10 drivers',
                'Real-time tracking',
                'Geofencing',
                'Reports & Analytics',
                'Priority support',
            ],
            color: colors.primaryBlue,
            popular: true,
        },
        {
            id: 'enterprise',
            name: t('subscription.enterprise.name'),
            price: t('subscription.enterprise.price'),
            period: '',
            features: [
                'Unlimited vehicles',
                'Unlimited drivers',
                'Custom integrations',
                'Dedicated support',
                'SLA guarantee',
                'On-premise option',
            ],
            color: colors.accentGold || '#f59e0b',
        },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryDark }]} edges={['top']}>
            {isDarkMode && (
                <LinearGradient
                    colors={[colors.primaryDark, '#0f172a', colors.primaryDark]}
                    style={StyleSheet.absoluteFillObject}
                />
            )}

            {/* Dashboard Header */}
            <DashboardHeader showSearch={false} />

            <View style={styles.header}>
                <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>{t('subscription.title')}</Text>
                <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>{t('subscription.subtitle')}</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {plans.map((plan) => (
                    <TouchableOpacity
                        key={plan.id}
                        style={[
                            styles.planCard,
                            {
                                backgroundColor: colors.surfaceCard,
                                borderColor: selectedPlan === plan.id ? plan.color : colors.borderGlass,
                                borderWidth: selectedPlan === plan.id ? 2 : 1,
                            },
                        ]}
                        onPress={() => setSelectedPlan(plan.id)}
                        activeOpacity={0.8}
                    >
                        {plan.popular && (
                            <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                                <Text style={[styles.popularText, { color: colors.white }]}>
                                    {t('subscription.popular')}
                                </Text>
                            </View>
                        )}

                        <View style={styles.planHeader}>
                            <Text style={[styles.planName, { color: colors.textPrimary }]}>{plan.name}</Text>
                            <View style={styles.priceContainer}>
                                <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
                                {plan.period && (
                                    <Text style={[styles.planPeriod, { color: colors.textMuted }]}>{plan.period}</Text>
                                )}
                            </View>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.borderGlass }]} />

                        <View style={styles.features}>
                            {plan.features.map((feature, index) => (
                                <View key={index} style={styles.featureItem}>
                                    <Ionicons name="checkmark-circle" size={18} color={plan.color} />
                                    <Text style={[styles.featureText, { color: colors.textSecondary }]}>{feature}</Text>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.selectButton,
                                {
                                    backgroundColor: selectedPlan === plan.id ? plan.color : colors.surfaceGlass,
                                    borderColor: plan.color,
                                }
                            ]}
                        >
                            <Text style={[
                                styles.selectButtonText,
                                { color: selectedPlan === plan.id ? colors.white : plan.color }
                            ]}>
                                {t('subscription.selectPlan')}
                            </Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}

                <View style={[styles.billingInfo, {
                    backgroundColor: colors.surfaceCard,
                    borderColor: colors.borderGlass,
                }]}>
                    <Text style={[styles.billingTitle, { color: colors.textPrimary }]}>
                        {t('subscription.billing')}
                    </Text>
                    <View style={styles.billingRow}>
                        <Ionicons name="card-outline" size={20} color={colors.textMuted} />
                        <Text style={[styles.billingText, { color: colors.textSecondary }]}>
                            •••• •••• •••• 4242
                        </Text>
                        <TouchableOpacity>
                            <Text style={[styles.editText, { color: colors.primaryBlue }]}>{t('common.edit')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 16, paddingTop: 8 },
    pageTitle: { fontSize: 24, fontWeight: '700' },
    pageSubtitle: { fontSize: 14, marginTop: 4 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 16, paddingTop: 0 },
    planCard: { borderRadius: 16, padding: 20, marginBottom: 16, position: 'relative', overflow: 'hidden' },
    popularBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    popularText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    planHeader: { marginBottom: 16 },
    planName: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
    priceContainer: { flexDirection: 'row', alignItems: 'baseline' },
    planPrice: { fontSize: 32, fontWeight: '700' },
    planPeriod: { fontSize: 14, marginLeft: 4 },
    divider: { height: 1, marginVertical: 16 },
    features: { gap: 10, marginBottom: 20 },
    featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    featureText: { fontSize: 14 },
    selectButton: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
    selectButtonText: { fontSize: 15, fontWeight: '600' },
    billingInfo: { borderRadius: 12, padding: 16, borderWidth: 1 },
    billingTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    billingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    billingText: { flex: 1, fontSize: 14 },
    editText: { fontSize: 14, fontWeight: '500' },
});

/**
 * FleetMan Mobile - Support Screen
 * Customer support page with theme and i18n support
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { DashboardHeader } from '../../src/components/DashboardHeader';

export default function SupportScreen() {
    const { t } = useTranslation();
    const { colors, isDarkMode } = useTheme();
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [message, setMessage] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    const contactMethods = [
        { id: 'email', icon: 'mail', label: t('support.email'), value: 'support@fleetman.com', action: t('support.sendEmail'), color: colors.primaryBlue },
        { id: 'phone', icon: 'call', label: t('support.phone'), value: '+237 6 00 00 00 00', action: t('support.call'), color: colors.successText },
        { id: 'chat', icon: 'chatbubbles', label: t('support.liveChat'), value: '24/7', action: t('support.startChat'), color: colors.accentPurple || '#8b5cf6' },
    ];

    const faqItems = [
        { question: 'How do I add a new vehicle?', answer: 'Go to the Vehicles tab and tap the + button to add a new vehicle.' },
        { question: 'How can I track my fleet in real-time?', answer: 'Use the Map tab to see all your vehicles in real-time.' },
        { question: 'How do I assign a driver to a vehicle?', answer: 'Open the vehicle details and select "Assign Driver".' },
        { question: 'Can I export my reports?', answer: 'Yes, go to Reports and tap "Export PDF" to download.' },
    ];

    const subjects = [
        'Technical Issue',
        'Billing Question',
        'Feature Request',
        'General Inquiry',
    ];

    const handleContact = (method: any) => {
        if (method.id === 'email') {
            Linking.openURL(`mailto:${method.value}`);
        } else if (method.id === 'phone') {
            Linking.openURL(`tel:${method.value.replace(/\s/g, '')}`);
        } else {
            Alert.alert(t('support.liveChat'), 'Starting live chat...');
        }
    };

    const handleSubmit = () => {
        if (!selectedSubject || !message.trim()) {
            Alert.alert(t('common.error'), 'Please fill in all fields');
            return;
        }
        Alert.alert(t('common.success'), 'Your message has been sent!');
        setMessage('');
        setSelectedSubject('');
    };

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
                <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>{t('support.title')}</Text>
                <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>{t('support.subtitle')}</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Contact Methods */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('support.contactUs')}</Text>
                    {contactMethods.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[styles.contactCard, {
                                backgroundColor: colors.surfaceCard,
                                borderColor: colors.borderGlass,
                            }]}
                            onPress={() => handleContact(method)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.contactIcon, { backgroundColor: method.color + '20' }]}>
                                <Ionicons name={method.icon as any} size={24} color={method.color} />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={[styles.contactLabel, { color: colors.textPrimary }]}>{method.label}</Text>
                                <Text style={[styles.contactValue, { color: colors.textSecondary }]}>{method.value}</Text>
                            </View>
                            <View style={[styles.contactAction, { backgroundColor: method.color }]}>
                                <Text style={[styles.contactActionText, { color: colors.white }]}>{method.action}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* FAQ */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('support.faq')}</Text>
                    <View style={[styles.faqContainer, {
                        backgroundColor: colors.surfaceCard,
                        borderColor: colors.borderGlass,
                    }]}>
                        {faqItems.map((item, index) => (
                            <View key={index}>
                                <TouchableOpacity
                                    style={[
                                        styles.faqItem,
                                        index < faqItems.length - 1 && [
                                            styles.faqItemBorder,
                                            { borderBottomColor: colors.borderGlass }
                                        ],
                                    ]}
                                    onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                >
                                    <Text style={[styles.faqQuestion, { color: colors.textPrimary }]}>{item.question}</Text>
                                    <Ionicons
                                        name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color={colors.textMuted}
                                    />
                                </TouchableOpacity>
                                {expandedFaq === index && (
                                    <View style={[styles.faqAnswer, { backgroundColor: colors.surfaceGlass }]}>
                                        <Text style={[styles.faqAnswerText, { color: colors.textSecondary }]}>{item.answer}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Contact Form */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('support.contactUs')}</Text>
                    <View style={[styles.formContainer, {
                        backgroundColor: colors.surfaceCard,
                        borderColor: colors.borderGlass,
                    }]}>
                        <View style={styles.subjectContainer}>
                            {subjects.map((subject) => (
                                <TouchableOpacity
                                    key={subject}
                                    style={[
                                        styles.subjectChip,
                                        { backgroundColor: colors.surfaceGlass, borderColor: colors.borderGlass },
                                        selectedSubject === subject && {
                                            backgroundColor: colors.primaryBlue,
                                            borderColor: colors.primaryBlue
                                        }
                                    ]}
                                    onPress={() => setSelectedSubject(subject)}
                                >
                                    <Text style={[
                                        styles.subjectText,
                                        { color: colors.textSecondary },
                                        selectedSubject === subject && { color: colors.white }
                                    ]}>
                                        {subject}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            style={[styles.messageInput, {
                                backgroundColor: colors.surfaceGlass,
                                borderColor: colors.borderGlass,
                                color: colors.textPrimary,
                            }]}
                            placeholder="Describe your issue..."
                            placeholderTextColor={colors.textMuted}
                            multiline
                            numberOfLines={4}
                            value={message}
                            onChangeText={setMessage}
                            textAlignVertical="top"
                        />

                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: colors.primaryBlue }]}
                            onPress={handleSubmit}
                        >
                            <Ionicons name="send" size={18} color={colors.white} />
                            <Text style={[styles.submitButtonText, { color: colors.white }]}>{t('support.sendEmail')}</Text>
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
    scrollContent: { padding: 16, paddingTop: 0, paddingBottom: 32 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    contactCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12, gap: 12 },
    contactIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    contactInfo: { flex: 1 },
    contactLabel: { fontSize: 15, fontWeight: '600' },
    contactValue: { fontSize: 13, marginTop: 2 },
    contactAction: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    contactActionText: { fontSize: 12, fontWeight: '600' },
    faqContainer: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
    faqItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    faqItemBorder: { borderBottomWidth: 1 },
    faqQuestion: { flex: 1, fontSize: 14, fontWeight: '500' },
    faqAnswer: { padding: 16, paddingTop: 0 },
    faqAnswerText: { fontSize: 13, lineHeight: 20 },
    formContainer: { borderRadius: 12, borderWidth: 1, padding: 16 },
    subjectContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    subjectChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
    subjectText: { fontSize: 12, fontWeight: '500' },
    messageInput: { borderRadius: 10, borderWidth: 1, padding: 12, minHeight: 100, marginBottom: 16, fontSize: 14 },
    submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 10, gap: 8 },
    submitButtonText: { fontSize: 15, fontWeight: '600' },
});

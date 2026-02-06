/**
 * FleetMan Mobile - Create Modal Component
 * Reusable modal wrapper for creation forms with theme support
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const { height } = Dimensions.get('window');

interface CreateModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onSubmit: () => void;
    submitText?: string;
    cancelText?: string;
    loading?: boolean;
    step?: number;
    totalSteps?: number;
}

export const CreateModal: React.FC<CreateModalProps> = ({
    visible,
    onClose,
    title,
    children,
    onSubmit,
    submitText,
    cancelText,
    loading = false,
    step,
    totalSteps,
}) => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const finalSubmitText = submitText || t('form.save');
    const finalCancelText = cancelText || t('form.cancel');
    const loadingText = t('form.loading');

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}
            >
                <View style={[styles.modalContainer, {
                    backgroundColor: colors.primaryDark,
                    borderColor: colors.borderGlass,
                }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.borderGlass }]}>
                        <View style={styles.titleContainer}>
                            <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                            {step && totalSteps && (
                                <Text style={[styles.stepIndicator, { color: colors.textMuted }]}>
                                    {t('createFleet.step1Title').includes('Étape') ? 'Étape' : 'Step'} {step}/{totalSteps}
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Progress bar for multi-step forms */}
                    {step && totalSteps && (
                        <View style={styles.progressContainer}>
                            <View style={[styles.progressBackground, { backgroundColor: colors.surfaceGlass }]}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${(step / totalSteps) * 100}%`,
                                            backgroundColor: colors.primaryBlue,
                                        }
                                    ]}
                                />
                            </View>
                        </View>
                    )}

                    {/* Content */}
                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={true}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                        bounces={true}
                        alwaysBounceVertical={true}
                    >
                        {children}
                    </ScrollView>

                    {/* Footer with actions */}
                    <View style={[styles.footer, { borderTopColor: colors.borderGlass }]}>
                        <TouchableOpacity
                            style={[styles.cancelButton, {
                                backgroundColor: colors.surfaceCard,
                                borderColor: colors.borderGlass,
                            }]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                                {finalCancelText}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                { backgroundColor: colors.primaryBlue },
                                loading && styles.submitButtonDisabled
                            ]}
                            onPress={onSubmit}
                            disabled={loading}
                        >
                            <Text style={[styles.submitButtonText, { color: colors.white }]}>
                                {loading ? loadingText : finalSubmitText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

// Form field components with theme support
interface FormFieldProps {
    label: string;
    required?: boolean;
    children: React.ReactNode;
    halfWidth?: boolean;
    zIndex?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    required = false,
    children,
    halfWidth = false,
    zIndex,
}) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.formField, halfWidth && styles.halfWidth, zIndex !== undefined && { zIndex }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
                {label} {required && <Text style={{ color: colors.errorText }}>*</Text>}
            </Text>
            {children}
        </View>
    );
};

interface FormRowProps {
    children: React.ReactNode;
    zIndex?: number;
}

export const FormRow: React.FC<FormRowProps> = ({ children, zIndex }) => (
    <View style={[styles.formRow, zIndex !== undefined && { zIndex }]}>{children}</View>
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: height * 0.9,
        minHeight: height * 0.4,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    stepIndicator: {
        fontSize: 12,
        marginTop: 4,
    },
    closeButton: {
        padding: 4,
    },
    progressContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    progressBackground: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    content: {
        flexGrow: 1,
        flexShrink: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 20,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    submitButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    formField: {
        marginBottom: 16,
    },
    halfWidth: {
        flex: 1,
    },
    formRow: {
        flexDirection: 'row',
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
});

export default CreateModal;

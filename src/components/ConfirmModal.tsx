/**
 * FleetMan Mobile - Confirm Modal Component
 * Reusable confirmation dialog with a premium look
 * Supports optional text confirmation for destructive actions
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Pressable,
    Animated,
    Dimensions,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface ConfirmModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    icon?: string;
    // New props for text confirmation
    requireTextConfirmation?: boolean;
    confirmationText?: string;
    confirmationPlaceholder?: string;
    confirmationLabel?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    visible,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    type = 'info',
    icon,
    requireTextConfirmation = false,
    confirmationText = '',
    confirmationPlaceholder = 'Tapez le nom pour confirmer',
    confirmationLabel,
}) => {
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState('');

    // Reset input when modal closes or opens
    useEffect(() => {
        if (!visible) {
            setInputValue('');
        }
    }, [visible]);

    const isConfirmDisabled = requireTextConfirmation && inputValue.trim().toLowerCase() !== confirmationText.trim().toLowerCase();

    const getIcon = () => {
        if (icon) return icon;
        switch (type) {
            case 'danger': return 'alert-circle';
            case 'warning': return 'warning';
            case 'info': return 'information-circle';
            default: return 'help-circle';
        }
    };

    const getColor = () => {
        switch (type) {
            case 'danger': return colors.errorText || '#ef4444';
            case 'warning': return colors.warningText || '#f59e0b';
            case 'info': return colors.primaryBlue || '#3b82f6';
            default: return colors.primaryBlue;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'danger': return (colors.errorBg || '#fef2f2') + '40';
            case 'warning': return (colors.warningBg || '#fffbeb') + '40';
            case 'info': return (colors.infoBg || '#eff6ff') + '40';
            default: return colors.surfaceGlass;
        }
    };

    const handleConfirm = () => {
        if (!isConfirmDisabled) {
            onConfirm();
            setInputValue('');
        }
    };

    const handleClose = () => {
        setInputValue('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={handleClose}
        >
            <Pressable style={styles.overlay} onPress={handleClose}>
                <Pressable
                    style={[
                        styles.modalContainer,
                        {
                            backgroundColor: colors.surfaceCard || (isDarkMode ? '#1e293b' : '#ffffff'),
                            borderColor: colors.borderGlass,
                        }
                    ]}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={[styles.iconContainer, { backgroundColor: getBgColor() }]}>
                        <Ionicons name={getIcon() as any} size={32} color={getColor()} />
                    </View>

                    <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                    <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

                    {/* Text Confirmation Input */}
                    {requireTextConfirmation && (
                        <View style={styles.confirmationContainer}>
                            <Text style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
                                {confirmationLabel || `Tapez "${confirmationText}" pour confirmer :`}
                            </Text>
                            <TextInput
                                style={[
                                    styles.confirmationInput,
                                    {
                                        backgroundColor: colors.surfaceGlass,
                                        borderColor: inputValue.trim().toLowerCase() === confirmationText.trim().toLowerCase()
                                            ? colors.successText
                                            : colors.borderGlass,
                                        color: colors.textPrimary,
                                    }
                                ]}
                                value={inputValue}
                                onChangeText={setInputValue}
                                placeholder={confirmationPlaceholder}
                                placeholderTextColor={colors.textMuted}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {inputValue.length > 0 && (
                                <View style={styles.matchIndicator}>
                                    {inputValue.trim().toLowerCase() === confirmationText.trim().toLowerCase() ? (
                                        <>
                                            <Ionicons name="checkmark-circle" size={16} color={colors.successText} />
                                            <Text style={[styles.matchText, { color: colors.successText }]}>
                                                Correspondance exacte
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="close-circle" size={16} color={colors.errorText} />
                                            <Text style={[styles.matchText, { color: colors.errorText }]}>
                                                Le texte ne correspond pas
                                            </Text>
                                        </>
                                    )}
                                </View>
                            )}
                        </View>
                    )}

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, { backgroundColor: colors.surfaceGlass, borderColor: colors.borderGlass }]}
                            onPress={handleClose}
                        >
                            <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                                {cancelText || t('common.cancel')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.confirmButton,
                                {
                                    backgroundColor: isConfirmDisabled
                                        ? (colors.textMuted + '50')
                                        : (type === 'danger' ? colors.errorText : colors.primaryBlue),
                                    opacity: isConfirmDisabled ? 0.6 : 1,
                                }
                            ]}
                            onPress={handleConfirm}
                            disabled={isConfirmDisabled}
                        >
                            <Text style={[styles.confirmButtonText, { color: '#ffffff' }]}>
                                {confirmText || t('common.confirm')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: Math.min(width * 0.9, 420),
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    confirmationContainer: {
        width: '100%',
        marginBottom: 20,
    },
    confirmationLabel: {
        fontSize: 13,
        marginBottom: 8,
        textAlign: 'center',
    },
    confirmationInput: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        fontSize: 15,
        textAlign: 'center',
    },
    matchIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        gap: 6,
    },
    matchText: {
        fontSize: 12,
        fontWeight: '500',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 1,
    },
    confirmButton: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    confirmButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
});

export default ConfirmModal;


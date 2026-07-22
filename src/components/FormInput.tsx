/**
 * FleetMan Mobile - Form Input Component
 * Styled input for forms with theme support
 */

import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInputProps,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface FormInputProps extends TextInputProps {
    icon?: string;
    error?: string;
    isPassword?: boolean;
    label?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
    icon,
    error,
    isPassword = false,
    label,
    style,
    ...props
}) => {
    const { colors } = useTheme();
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View>
            {label ? (
                <Text style={{ color: colors.textPrimary, marginBottom: 6, fontSize: 14, fontWeight: '500' }}>
                    {label}
                </Text>
            ) : null}
            <View style={[
                styles.inputContainer,
                {
                    backgroundColor: colors.surfaceCard,
                    borderColor: error ? colors.errorBorder : colors.borderGlass,
                }
            ]}>
                {icon && (
                    <Ionicons
                        name={icon as any}
                        size={20}
                        color={colors.textMuted}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={[styles.input, { color: colors.textPrimary }, style]}
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={isPassword && !showPassword}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color={colors.textMuted}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={[styles.errorText, { color: colors.errorText }]}>{error}</Text>}
        </View>
    );
};

interface FormSelectProps {
    value: string;
    options: { label: string; value: string }[];
    onSelect: (value: string) => void;
    placeholder?: string;
    error?: string;
    zIndex?: number;
    openDirection?: 'auto' | 'up' | 'down';
}

export const FormSelect: React.FC<FormSelectProps> = ({
    value,
    options,
    onSelect,
    placeholder,
    error,
    zIndex = 10,
    openDirection = 'auto',
}) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(opt => opt.value === value);
    const finalPlaceholder = placeholder || t('form.select');

    // Determine if dropdown should open upward
    const shouldOpenUp = openDirection === 'up';

    return (
        <View style={[
            styles.selectWrapper,
            { zIndex: isOpen ? 9999 : zIndex },
            isOpen && styles.selectWrapperOpen
        ]}>
            <TouchableOpacity
                style={[styles.selectButton, {
                    backgroundColor: colors.surfaceCard,
                    borderColor: error ? colors.errorBorder : colors.borderGlass,
                }]}
                onPress={() => setIsOpen(!isOpen)}
            >
                <Text style={[
                    styles.selectText,
                    { color: selectedOption ? colors.textPrimary : colors.textMuted }
                ]}>
                    {selectedOption?.label || finalPlaceholder}
                </Text>
                <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textMuted}
                />
            </TouchableOpacity>

            {isOpen && (
                <View style={[
                    styles.optionsContainer,
                    {
                        backgroundColor: colors.surfaceCard,
                        borderColor: colors.borderGlass,
                    },
                    shouldOpenUp && styles.optionsContainerUp
                ]}>
                    <ScrollView
                        bounces={false}
                        style={{ maxHeight: 200 }}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                    >
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.option,
                                    { borderBottomColor: colors.borderGlass },
                                    value === option.value && { backgroundColor: colors.surfaceGlass }
                                ]}
                                onPress={() => {
                                    onSelect(option.value);
                                    setIsOpen(false);
                                }}
                            >
                                <Text style={[
                                    styles.optionText,
                                    { color: value === option.value ? colors.primaryBlue : colors.textSecondary }
                                ]}>
                                    {option.label}
                                </Text>
                                {value === option.value && (
                                    <Ionicons name="checkmark" size={18} color={colors.primaryBlue} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
            {error && <Text style={[styles.errorText, { color: colors.errorText, marginLeft: 0 }]}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 14,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
    },
    selectWrapper: {
        position: 'relative',
        zIndex: 10,
    },
    selectWrapperOpen: {
        zIndex: 1000,
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    selectText: {
        fontSize: 15,
    },
    optionsContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        borderRadius: 10,
        borderWidth: 1,
        marginTop: 4,
        maxHeight: 200,
        overflow: 'visible',
        elevation: 999,
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    optionsContainerUp: {
        top: 'auto',
        bottom: '100%',
        marginTop: 0,
        marginBottom: 4,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    optionText: {
        fontSize: 15,
    },
});

export default FormInput;

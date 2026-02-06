/**
 * FleetMan Mobile - Toast Notification System
 * A simple, elegant toast notification component for API errors and status messages
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        // Return a no-op function if context is not available (for use in api.ts)
        return {
            showToast: (message: string, type?: ToastType, duration?: number) => {
                console.warn('[Toast] Context not available, logging instead:', message);
            },
            hideToast: (id: string) => { },
        };
    }
    return context;
};

// Global toast function for use outside React components (like in api.ts)
let globalShowToast: ((message: string, type?: ToastType, duration?: number) => void) | null = null;

export const setGlobalToastHandler = (handler: typeof globalShowToast) => {
    globalShowToast = handler;
};

export const showGlobalToast = (message: string, type: ToastType = 'error', duration: number = 4000) => {
    if (globalShowToast) {
        globalShowToast(message, type, duration);
    } else {
        console.warn('[Toast] Global handler not set, logging instead:', message);
    }
};

const ToastItem: React.FC<{ toast: Toast; onHide: (id: string) => void }> = ({ toast, onHide }) => {
    const { colors } = useTheme();
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animate in
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto hide after duration
        const timer = setTimeout(() => {
            hideToast();
        }, toast.duration || 4000);

        return () => clearTimeout(timer);
    }, []);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide(toast.id);
        });
    };

    const getToastStyles = () => {
        switch (toast.type) {
            case 'success':
                return {
                    backgroundColor: colors.successBg,
                    borderColor: colors.successBorder,
                    iconName: 'checkmark-circle' as const,
                    iconColor: colors.successText,
                };
            case 'error':
                return {
                    backgroundColor: colors.errorBg,
                    borderColor: colors.errorBorder,
                    iconName: 'alert-circle' as const,
                    iconColor: colors.errorText,
                };
            case 'warning':
                return {
                    backgroundColor: colors.warningBg,
                    borderColor: colors.warningBorder,
                    iconName: 'warning' as const,
                    iconColor: colors.warningText,
                };
            case 'info':
            default:
                return {
                    backgroundColor: colors.infoBg,
                    borderColor: colors.infoBorder,
                    iconName: 'information-circle' as const,
                    iconColor: colors.infoText,
                };
        }
    };

    const toastStyles = getToastStyles();

    return (
        <Animated.View
            style={[
                styles.toast,
                {
                    backgroundColor: toastStyles.backgroundColor,
                    borderColor: toastStyles.borderColor,
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <View style={styles.toastContent}>
                <Ionicons name={toastStyles.iconName} size={24} color={toastStyles.iconColor} />
                <Text style={[styles.toastText, { color: colors.textPrimary }]} numberOfLines={3}>
                    {toast.message}
                </Text>
                <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
                    <Ionicons name="close" size={20} color={colors.textMuted} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const hideToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    // Set up global handler
    useEffect(() => {
        setGlobalToastHandler(showToast);
        return () => setGlobalToastHandler(null);
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            <View style={styles.container} pointerEvents="box-none">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onHide={hideToast} />
                ))}
            </View>
        </ToastContext.Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
        elevation: 9999,
    },
    toast: {
        width: width - 32,
        marginBottom: 8,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    toastContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toastText: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
    closeButton: {
        padding: 4,
    },
});

export default ToastProvider;

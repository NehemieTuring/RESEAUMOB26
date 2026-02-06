import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Pressable,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { height } = Dimensions.get('window');

interface DataItem {
    label: string;
    value: string | number | boolean | null | undefined;
    icon?: keyof typeof Ionicons.glyphMap;
    fullWidth?: boolean;
}

interface DataDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    data: DataItem[];
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
}

export const DataDetailsModal: React.FC<DataDetailsModalProps> = ({
    visible,
    onClose,
    title,
    description,
    data,
    icon = 'information-circle',
    iconColor,
}) => {
    const { colors } = useTheme();

    const renderValue = (value: any) => {
        if (value === null || value === undefined || value === '') return '-';
        if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
        return String(value);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Background pressable to close */}
                <Pressable style={styles.backdrop} onPress={onClose} />

                {/* Modal Content - NOT wrapped in TouchableWithoutFeedback */}
                <View
                    style={[
                        styles.container,
                        { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }
                    ]}
                >
                    {/* Handle Bar */}
                    <View style={[styles.handle, { backgroundColor: colors.borderGlass }]} />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[styles.iconContainer, { backgroundColor: (iconColor || colors.primaryBlue) + '15' }]}>
                            <Ionicons name={icon} size={28} color={iconColor || colors.primaryBlue} />
                        </View>
                        <View style={styles.titleContainer}>
                            <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                            {description && (
                                <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
                            )}
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {/* Content - ScrollView can now scroll freely */}
                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={true}
                        contentContainerStyle={styles.scrollContent}
                        nestedScrollEnabled={true}
                        bounces={true}
                    >
                        <View style={styles.grid}>
                            {data.map((item, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.item,
                                        item.fullWidth ? styles.fullWidthItem : styles.halfWidthItem,
                                        { borderBottomColor: colors.borderGlass + '20' }
                                    ]}
                                >
                                    <View style={styles.labelRow}>
                                        {item.icon && (
                                            <Ionicons name={item.icon} size={14} color={colors.textMuted} style={{ marginRight: 6 }} />
                                        )}
                                        <Text style={[styles.label, { color: colors.textMuted }]}>{item.label}</Text>
                                    </View>
                                    <Text style={[styles.value, { color: colors.textPrimary }]}>
                                        {renderValue(item.value)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Footer / Action */}
                    <View style={[styles.footer, { borderTopColor: colors.borderGlass + '40' }]}>
                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: colors.surfaceGlass, borderColor: colors.borderGlass }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.closeButtonText, { color: colors.textPrimary }]}>Fermer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        width: '100%',
        maxHeight: height * 0.85,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderWidth: 1,
        borderBottomWidth: 0,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    description: {
        fontSize: 14,
        marginTop: 2,
    },
    closeBtn: {
        padding: 4,
    },
    content: {
        flexGrow: 0,
        flexShrink: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    item: {
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    halfWidthItem: {
        width: '48%',
    },
    fullWidthItem: {
        width: '100%',
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 22,
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    closeButton: {
        width: '100%',
        height: 54,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

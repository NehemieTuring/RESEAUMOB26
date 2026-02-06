/**
 * FleetMan Mobile - Global Styles
 * Premium, modern design system
 */

import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

export const globalStyles = StyleSheet.create({
    // ============================================================================
    // LAYOUT
    // ============================================================================
    container: {
        flex: 1,
        backgroundColor: Colors.primaryDark,
    },
    safeArea: {
        flex: 1,
        backgroundColor: Colors.primaryDark,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ============================================================================
    // CARDS & SURFACES
    // ============================================================================
    card: {
        backgroundColor: Colors.surfaceCard,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.borderGlass,
        ...Platform.select({
            ios: {
                shadowColor: Colors.black,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    cardGlass: {
        backgroundColor: Colors.surfaceGlass,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.borderGlass,
        backdropFilter: 'blur(10px)',
    },
    cardSmall: {
        backgroundColor: Colors.surfaceCard,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.borderGlass,
    },

    // ============================================================================
    // TYPOGRAPHY
    // ============================================================================
    textPrimary: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: '400',
    },
    textSecondary: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontWeight: '400',
    },
    textMuted: {
        color: Colors.textMuted,
        fontSize: 12,
        fontWeight: '400',
    },
    heading1: {
        color: Colors.textPrimary,
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    heading2: {
        color: Colors.textPrimary,
        fontSize: 24,
        fontWeight: '600',
        letterSpacing: -0.3,
    },
    heading3: {
        color: Colors.textPrimary,
        fontSize: 20,
        fontWeight: '600',
    },
    heading4: {
        color: Colors.textPrimary,
        fontSize: 18,
        fontWeight: '500',
    },
    subtitle: {
        color: Colors.textSecondary,
        fontSize: 16,
        lineHeight: 24,
    },
    label: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },

    // ============================================================================
    // BUTTONS
    // ============================================================================
    buttonPrimary: {
        backgroundColor: Colors.primaryBlue,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    buttonPrimaryText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    buttonSecondary: {
        backgroundColor: Colors.surfaceGlass,
        borderWidth: 1,
        borderColor: Colors.borderGlass,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    buttonSecondaryText: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    buttonGradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonSmall: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    buttonLarge: {
        paddingVertical: 18,
        paddingHorizontal: 32,
    },

    // ============================================================================
    // INPUTS
    // ============================================================================
    input: {
        backgroundColor: Colors.surfaceGlass,
        borderWidth: 1,
        borderColor: Colors.borderGlass,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        color: Colors.textPrimary,
        fontSize: 16,
    },
    inputFocused: {
        borderColor: Colors.primaryCyan,
        borderWidth: 2,
    },
    inputError: {
        borderColor: Colors.errorBorder,
        borderWidth: 2,
    },
    inputLabel: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputIcon: {
        position: 'absolute',
        left: 16,
        top: 14,
    },
    inputWithIcon: {
        paddingLeft: 48,
    },
    errorText: {
        color: Colors.errorText,
        fontSize: 12,
        marginTop: 4,
    },

    // ============================================================================
    // STATUS & BADGES
    // ============================================================================
    badge: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    badgeSuccess: {
        backgroundColor: Colors.successBg,
        borderWidth: 1,
        borderColor: Colors.successBorder,
    },
    badgeSuccessText: {
        color: Colors.successText,
        fontSize: 12,
        fontWeight: '600',
    },
    badgeError: {
        backgroundColor: Colors.errorBg,
        borderWidth: 1,
        borderColor: Colors.errorBorder,
    },
    badgeErrorText: {
        color: Colors.errorText,
        fontSize: 12,
        fontWeight: '600',
    },
    badgeWarning: {
        backgroundColor: Colors.warningBg,
        borderWidth: 1,
        borderColor: Colors.warningBorder,
    },
    badgeWarningText: {
        color: Colors.warningText,
        fontSize: 12,
        fontWeight: '600',
    },
    badgeInfo: {
        backgroundColor: Colors.infoBg,
        borderWidth: 1,
        borderColor: Colors.infoBorder,
    },
    badgeInfoText: {
        color: Colors.infoText,
        fontSize: 12,
        fontWeight: '600',
    },

    // ============================================================================
    // UTILITY
    // ============================================================================
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rowWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    column: {
        flexDirection: 'column',
    },
    gap4: { gap: 4 },
    gap8: { gap: 8 },
    gap12: { gap: 12 },
    gap16: { gap: 16 },
    gap20: { gap: 20 },

    mt8: { marginTop: 8 },
    mt16: { marginTop: 16 },
    mt20: { marginTop: 20 },
    mt24: { marginTop: 24 },
    mb8: { marginBottom: 8 },
    mb16: { marginBottom: 16 },
    mb20: { marginBottom: 20 },

    p8: { padding: 8 },
    p16: { padding: 16 },
    p20: { padding: 20 },

    // ============================================================================
    // DIVIDERS
    // ============================================================================
    divider: {
        height: 1,
        backgroundColor: Colors.borderGlass,
        marginVertical: 16,
    },
    dividerVertical: {
        width: 1,
        backgroundColor: Colors.borderGlass,
        marginHorizontal: 16,
    },

    // ============================================================================
    // OVERLAYS
    // ============================================================================
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: Colors.surfaceCard,
        borderRadius: 20,
        padding: 24,
        width: width - 48,
        maxWidth: 400,
        borderWidth: 1,
        borderColor: Colors.borderGlass,
    },

    // ============================================================================
    // ICON CONTAINERS
    // ============================================================================
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: Colors.surfaceGlass,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.borderGlass,
    },
    iconContainerSmall: {
        width: 36,
        height: 36,
        borderRadius: 10,
    },
    iconContainerLarge: {
        width: 64,
        height: 64,
        borderRadius: 16,
    },
    iconGradient: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ============================================================================
    // AVATAR
    // ============================================================================
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.surfaceGlass,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
    },

    // ============================================================================
    // LIST ITEMS
    // ============================================================================
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.surfaceCard,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.borderGlass,
    },
    listItemContent: {
        flex: 1,
        marginLeft: 12,
    },
    listItemTitle: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: '500',
    },
    listItemSubtitle: {
        color: Colors.textSecondary,
        fontSize: 14,
        marginTop: 2,
    },
    listItemChevron: {
        color: Colors.textMuted,
    },
});

export default globalStyles;

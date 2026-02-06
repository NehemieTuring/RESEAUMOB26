/**
 * FleetMan Mobile - Color Palette
 * Premium Modern Design System
 * Supports Dark and Light themes
 */

// Dark theme colors - Premium Midnight Blue Design
export const DarkColors = {
    // Primary Colors - Deep midnight blue with vibrant accents
    primaryDark: '#0f172a',          // Slate 900 - Rich deep blue
    primaryBlue: '#06b6d4',          // Cyan 500 - Vibrant cyan
    primaryCyan: '#14b8a6',          // Teal 500 - Fresh teal
    accentOrange: '#f97316',         // Orange 500 - Warm orange
    accentPurple: '#a855f7',         // Purple 500 - Soft purple

    // Gradients colors (for LinearGradient) - More vibrant
    gradientPrimary: ['#0f172a', '#1e293b', '#0f172a'] as const,
    gradientAccent: ['#06b6d4', '#14b8a6'] as const,
    gradientGlow: ['rgba(6, 182, 212, 0.2)', 'rgba(20, 184, 166, 0.2)'] as const,
    gradientCard: ['#1e293b', '#0f172a'] as const,

    // Surfaces - Elevated glass effect with blue undertones
    surfaceGlass: 'rgba(30, 41, 59, 0.7)',        // Slate 800 with transparency
    surfaceGlassHover: 'rgba(51, 65, 85, 0.8)',   // Slate 700 with transparency
    surfaceCard: '#1e293b',                        // Slate 800 - Solid cards
    surfaceElevated: '#334155',                    // Slate 700 - Elevated surfaces
    borderGlass: 'rgba(148, 163, 184, 0.15)',     // Slate 400 subtle border
    navBg: 'rgba(15, 23, 42, 0.95)',              // Near-solid nav background

    // Text - Clean hierarchy with great contrast
    textPrimary: '#f1f5f9',          // Slate 100 - Soft white
    textSecondary: '#94a3b8',        // Slate 400 - Muted gray
    textMuted: '#64748b',            // Slate 500 - Very muted

    // Status Colors - Rich and vibrant
    errorBg: 'rgba(255, 68, 68, 0.1)',
    errorBorder: '#ff4b4b',
    errorText: '#ff4b4b',

    successBg: 'rgba(34, 197, 94, 0.15)',
    successBorder: '#22c55e',
    successText: '#86efac',

    warningBg: 'rgba(251, 191, 36, 0.15)',
    warningBorder: '#fbbf24',
    warningText: '#fde047',

    infoBg: 'rgba(6, 182, 212, 0.15)',
    infoBorder: '#06b6d4',
    infoText: '#67e8f9',

    // Shadows - Soft blue-tinted shadows
    shadowSm: 'rgba(0, 0, 0, 0.3)',
    shadowMd: 'rgba(0, 0, 0, 0.4)',
    shadowLg: 'rgba(0, 0, 0, 0.5)',

    // Transparent
    transparent: 'transparent',
    white: '#ffffff',
    black: '#000000',
    accentGold: '#fbbf24',
};

// Light theme colors - Light blue, white, and orange
export const LightColors = {
    // Primary Colors - Light and bright
    primaryDark: '#f0f9ff', // Light blue background
    primaryBlue: '#0284c7', // Sky blue
    primaryCyan: '#0d9488', // Teal
    accentOrange: '#ea580c', // Vibrant orange
    accentPurple: '#7c3aed',

    // Gradients colors (for LinearGradient)
    gradientPrimary: ['#f0f9ff', '#e0f2fe', '#f0f9ff'] as const,
    gradientAccent: ['#0284c7', '#0d9488'] as const,
    gradientGlow: ['rgba(2, 132, 199, 0.1)', 'rgba(13, 148, 136, 0.1)'] as const,
    gradientCard: ['#ffffff', '#f8fafc'] as const,

    // Surfaces - Light and clean
    surfaceGlass: 'rgba(0, 0, 0, 0.02)',
    surfaceGlassHover: 'rgba(0, 0, 0, 0.04)',
    surfaceCard: '#ffffff',
    surfaceElevated: '#f8fafc',
    borderGlass: 'rgba(0, 0, 0, 0.08)',
    navBg: '#ffffff',

    // Text - Dark for readability
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',

    // Status Colors
    errorBg: '#fef2f2',
    errorBorder: '#fca5a5',
    errorText: '#dc2626',

    successBg: '#f0fdf4',
    successBorder: '#86efac',
    successText: '#16a34a',

    warningBg: '#fffbeb',
    warningBorder: '#fcd34d',
    warningText: '#d97706',

    infoBg: '#f0f9ff',
    infoBorder: '#7dd3fc',
    infoText: '#0284c7',

    // Shadows
    shadowSm: 'rgba(0, 0, 0, 0.05)',
    shadowMd: 'rgba(0, 0, 0, 0.1)',
    shadowLg: 'rgba(0, 0, 0, 0.15)',

    // Transparent
    transparent: 'transparent',
    white: '#ffffff',
    black: '#000000',
    accentGold: '#d97706',
};

// Type for theme colors (generic to support both themes)
export interface ThemeColors {
    primaryDark: string;
    primaryBlue: string;
    primaryCyan: string;
    accentOrange: string;
    accentPurple: string;
    gradientPrimary: readonly [string, string, string];
    gradientAccent: readonly [string, string];
    gradientGlow: readonly [string, string];
    gradientCard: readonly [string, string];
    surfaceGlass: string;
    surfaceGlassHover: string;
    surfaceCard: string;
    surfaceElevated: string;
    borderGlass: string;
    navBg: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    errorBg: string;
    errorBorder: string;
    errorText: string;
    successBg: string;
    successBorder: string;
    successText: string;
    warningBg: string;
    warningBorder: string;
    warningText: string;
    infoBg: string;
    infoBorder: string;
    infoText: string;
    shadowSm: string;
    shadowMd: string;
    shadowLg: string;
    transparent: string;
    white: string;
    black: string;
    accentGold: string;
}

// Default export (for backward compatibility)
export const Colors = DarkColors;

export default Colors;

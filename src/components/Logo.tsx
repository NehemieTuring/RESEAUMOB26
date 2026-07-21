/**
 * FleetMan Mobile - Logo Component
 * Replaced with the new logo-fleetman.png generated from the SVG.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface LogoProps {
    size?: 'small' | 'medium' | 'large' | 'xlarge';
    style?: ViewStyle;
}

export const Logo: React.FC<LogoProps> = ({
    size = 'medium',
    style,
}) => {
    const { colors, isDarkMode } = useTheme();

    const getSize = () => {
        switch (size) {
            case 'small': return { width: 100, height: 35 };
            case 'large': return { width: 180, height: 60 };
            case 'xlarge': return { width: 220, height: 80 };
            default: return { width: 140, height: 45 };
        }
    };

    const dimensions = getSize();

    return (
        <View style={[styles.container, style]}>
            <Image 
                source={require('../../assets/images/logo-fleetman.png')}
                style={{
                    width: dimensions.width,
                    height: dimensions.height,
                    resizeMode: 'contain',
                    tintColor: isDarkMode ? '#ffffff' : undefined // Optional: white logo in dark mode if needed
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Logo;

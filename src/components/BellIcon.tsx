import React from 'react';
import Svg, { Path } from 'react-native-svg';

/** Cloche SVG — évite le glyphe Ionicons « notifications » cassé sur le web. */
export function BellIcon({ size = 22, color = '#f59e0b' }: { size?: number; color: string }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M10.3 21a1.94 1.94 0 0 0 3.4 0"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

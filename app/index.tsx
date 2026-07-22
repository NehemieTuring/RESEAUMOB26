/**
 * FleetMan Mobile - Welcome/Landing Screen
 * Premium landing page with animations
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
    TouchableOpacity,
    ImageBackground,
    ScrollView,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Button, Logo, PageHeader } from '../src/components';

const { width, height } = Dimensions.get('window');

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WelcomeScreen() {
    const router = useRouter();
    const { colors, isDarkMode, toggleTheme } = useTheme();
    const { t, i18n } = useTranslation();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleLogin = () => {
        router.push('/(auth)/login');
    };

    const handleRegister = () => {
        router.push('/(auth)/register');
    };

    const handleTestAdmin = async () => {
        await AsyncStorage.setItem('user', JSON.stringify({
            userId: 1,
            email: 'admin@test.com',
            fullName: 'Test Admin',
            role: 'SUPER_ADMIN',
            userType: 'ADMIN',
            adminId: 1,
            organizationId: 1,
        }));
        await AsyncStorage.setItem('isLoggedIn', 'true');
        router.replace('/(tabs)/home');
    };

    const handleTestManager = async () => {
        await AsyncStorage.setItem('user', JSON.stringify({
            userId: 2,
            email: 'manager@test.com',
            fullName: 'Test Manager',
            role: 'FLEET_MANAGER',
            userType: 'FLEET_MANAGER',
            adminId: 1,
            organizationId: 1,
        }));
        await AsyncStorage.setItem('isLoggedIn', 'true');
        router.replace('/(tabs)/home');
    };

    const handleTestDriver = async () => {
        await AsyncStorage.setItem('user', JSON.stringify({
            userId: 3,
            email: 'driver@test.com',
            fullName: 'Test Driver',
            role: 'DRIVER',
            userType: 'DRIVER',
            organizationId: 1,
        }));
        await AsyncStorage.setItem('isLoggedIn', 'true');
        router.replace('/(driver)/home');
    };

    return (
        <ImageBackground 
            source={require('../assets/africa-globe-hero.jpg')} 
            style={[styles.container, { backgroundColor: colors.primaryDark }]}
            imageStyle={{ opacity: isDarkMode ? 0.8 : 0.7 }}
        >
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <LinearGradient
                colors={isDarkMode ? ['rgba(9, 9, 11, 0.6)', 'rgba(15, 23, 42, 0.7)', 'rgba(9, 9, 11, 0.8)'] : ['rgba(248, 250, 252, 0.5)', 'rgba(255, 255, 255, 0.4)', 'rgba(241, 245, 249, 0.6)']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <View style={[styles.decorativeCircle1, { backgroundColor: isDarkMode ? 'rgba(14, 165, 233, 0.08)' : 'rgba(2, 132, 199, 0.05)' }]} />
            <View style={[styles.decorativeCircle2, { backgroundColor: isDarkMode ? 'rgba(20, 184, 166, 0.06)' : 'rgba(13, 148, 136, 0.04)' }]} />
            <PageHeader showBackButton={false} />
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim }
                        ]
                    }}
                >
                    <View style={styles.logoContainer}>
                        <Image 
                            source={require('../assets/images/logo-fleetman.png')} 
                            style={{ width: 200, height: 60, resizeMode: 'contain', tintColor: '#ffffff' }}
                        />
                    </View>
                <View style={styles.heroContainer}>
                    <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
                        {`${t('welcome.title') || 'Manage your fleet'}\n`}
                        <Text style={[styles.heroTitleAccent, { color: isDarkMode ? colors.primaryCyan : colors.primaryBlue }]}>
                            {t('welcome.titleAccent') || 'in real time'}
                        </Text>
                    </Text>
                    <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                        {t('welcome.subtitle')}
                    </Text>
                </View>
                <View style={styles.featuresContainer}>
                    <View style={styles.featureItem}>
                        <View style={[styles.featureIcon, { backgroundColor: colors.primaryBlue + '10', borderColor: colors.primaryBlue + '20' }]}>
                            <Ionicons name="location" size={20} color={colors.primaryBlue} />
                        </View>
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>{t('welcome.featureLiveTracking')}</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <View style={[styles.featureIcon, { backgroundColor: colors.primaryBlue + '10', borderColor: colors.primaryBlue + '20' }]}>
                            <Ionicons name="notifications" size={20} color={colors.primaryBlue} />
                        </View>
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>{t('welcome.featureAlerts')}</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <View style={[styles.featureIcon, { backgroundColor: colors.primaryBlue + '10', borderColor: colors.primaryBlue + '20' }]}>
                            <Ionicons name="analytics" size={20} color={colors.primaryBlue} />
                        </View>
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>{t('welcome.featureAnalytics')}</Text>
                    </View>
                </View>
                <View style={styles.buttonsContainer}>
                    <Button
                        title={t('welcome.login')}
                        onPress={handleLogin}
                        variant="primary"
                        size="large"
                        style={{ width: '100%' }}
                        icon={<Ionicons name="log-in-outline" size={20} color={colors.white} />}
                    />
                    <Button
                        title={t('welcome.register')}
                        onPress={handleRegister}
                        variant={isDarkMode ? "outline" : "secondary"}
                        size="large"
                        style={{ width: '100%' }}
                        icon={<Ionicons name="person-add-outline" size={20} color={isDarkMode ? colors.primaryBlue : colors.textPrimary} />}
                    />
                    

                </View>
                <Text style={[styles.footer, { color: colors.textMuted }]}>
                    {t('welcome.copyright')}
                </Text>
                </Animated.View>
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, width: '100%', minHeight: '100%'
    },
    themeToggle: {
        position: 'absolute',
        top: 60,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    decorativeCircle1: {
        position: 'absolute',
        top: -height * 0.15,
        right: -width * 0.3,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: -height * 0.1,
        left: -width * 0.2,
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
        justifyContent: 'space-between',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    heroContainer: {
        marginBottom: 32,
    },
    heroTitle: {
        fontSize: 36,
        fontWeight: '900',
        textAlign: 'center',
        lineHeight: 44,
        letterSpacing: -1,
    },
    heroTitleAccent: {
        fontWeight: '900',
    },
    heroSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 24,
        paddingHorizontal: 8,
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 40,
        paddingHorizontal: 8,
    },
    featureItem: {
        alignItems: 'center',
        flex: 1,
    },
    featureIcon: {
        width: 54,
        height: 54,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        borderWidth: 1,
    },
    featureText: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '600',
    },
    buttonsContainer: {
        gap: 16,
        marginBottom: 24,
    },
    footer: {
        fontSize: 12,
        textAlign: 'center',
    },
});

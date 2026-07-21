/**
 * FleetMan Mobile - Driver Profile
 * Profile view for the connected driver (Vues 1.3 & 1.4)
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { DashboardHeader, FormInput, Button } from '../../src/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function DriverProfileScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors, isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Mock user data for driver
    const [user, setUser] = useState<any>({
        fullName: 'Conducteur Test',
        email: 'driver@test.com',
        phoneNumber: '+237 600000000',
        licenseNumber: 'PC-12345678',
        cardNumber: 'PRO-987654',
        status: 'ACTIVE',
        createdAt: '2022-01-15T00:00:00Z',
        address: 'Douala, Cameroun'
    });
    
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ phone: '', address: '' });

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const sessionUser = JSON.parse(userStr);
                // Dans la réalité, on ferait un GET /api/drivers/{id}
                setUser(prev => ({
                    ...prev,
                    fullName: sessionUser.fullName || prev.fullName,
                    email: sessionUser.email || prev.email,
                }));
                setFormData({
                    phone: user.phoneNumber,
                    address: user.address,
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à vos photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
            Alert.alert('Succès', 'Photo de profil mise à jour');
        }
    };

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setUser({...user, ...formData});
            setEditMode(false);
            Alert.alert("Succès", "Vos informations ont été mises à jour.");
        }, 1000);
    };

    const handleLogout = () => {
        Alert.alert(
            "Déconnexion",
            "Êtes-vous sûr de vouloir vous déconnecter ?",
            [
                { text: "Annuler", style: "cancel" },
                { 
                    text: "Se déconnecter", 
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.removeItem('user');
                        await AsyncStorage.removeItem('userToken');
                        router.replace('/(auth)/login');
                    }
                }
            ]
        );
    };

    const InfoRow = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
        <View style={[styles.infoRow, { borderBottomColor: colors.borderGlass }]}>
            <View style={[styles.infoIconContainer, { backgroundColor: colors.primaryBlue + '15' }]}>
                <Ionicons name={icon as any} size={18} color={colors.primaryBlue} />
            </View>
            <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value || '-'}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.primaryDark }]}>
                <ActivityIndicator size="large" color={colors.primaryBlue} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryDark }]} edges={['top']}>
            <DashboardHeader showSearch={false} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Mon Profil</Text>
                <TouchableOpacity onPress={() => setEditMode(!editMode)}>
                    <Ionicons name={editMode ? "close" : "pencil"} size={24} color={colors.primaryBlue} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Profile Picture Section */}
                <View style={styles.photoSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.photo} />
                        ) : (
                            <View style={[styles.photoPlaceholder, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                                <Ionicons name="person-outline" size={60} color={colors.textMuted} />
                            </View>
                        )}
                        <View style={[styles.editBadge, { backgroundColor: colors.primaryBlue }]}>
                            <Ionicons name="camera" size={16} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.userName, { color: colors.textPrimary }]}>{user.fullName}</Text>
                    <Text style={[styles.userRole, { color: colors.primaryBlue, marginBottom: 8, marginTop: 4, textAlign: 'center', fontSize: 14, fontWeight: 'bold' }]}>
                        CONDUCTEUR
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: user.status === 'ACTIVE' ? colors.successText + '20' : colors.errorText + '20' }]}>
                        <Ionicons name="checkmark-circle" size={14} color={user.status === 'ACTIVE' ? colors.successText : colors.errorText} style={{marginRight: 4}}/>
                        <Text style={[styles.statusText, { color: user.status === 'ACTIVE' ? colors.successText : colors.errorText }]}>
                            {user.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                        </Text>
                    </View>
                </View>

                {editMode ? (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>MODIFICATION DU PROFIL</Text>
                        <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass, padding: 16 }]}>
                            <Text style={[styles.readOnlyWarning, { color: colors.textMuted }]}>
                                Seuls votre téléphone et votre adresse sont modifiables. Pour le reste, contactez le gestionnaire.
                            </Text>
                            <FormInput
                                label="Téléphone"
                                value={formData.phone}
                                onChangeText={(text) => setFormData({...formData, phone: text})}
                                placeholder="Numéro de téléphone"
                                keyboardType="phone-pad"
                            />
                            <FormInput
                                label="Adresse"
                                value={formData.address}
                                onChangeText={(text) => setFormData({...formData, address: text})}
                                placeholder="Votre adresse complète"
                                multiline
                            />
                            <Button 
                                title="Sauvegarder les modifications" 
                                onPress={handleSave} 
                                isLoading={saving}
                                style={{ marginTop: 16 }}
                            />
                        </View>
                    </View>
                ) : (
                    <View>
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>INFORMATIONS DE CONTACT</Text>
                            <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                                <InfoRow label="Email" value={user.email} icon="mail" />
                                <InfoRow label="Téléphone" value={user.phoneNumber} icon="call" />
                                <InfoRow label="Adresse" value={user.address} icon="home" />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>INFORMATIONS PROFESSIONNELLES</Text>
                            <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                                <InfoRow label="Permis de conduire" value={user.licenseNumber} icon="card" />
                                <InfoRow label="Carte professionnelle" value={user.cardNumber} icon="briefcase" />
                                <InfoRow label="Date d'adhésion" value={new Date(user.createdAt).toLocaleDateString('fr-FR')} icon="calendar" />
                            </View>
                        </View>
                    </View>
                )}

                <View style={[styles.section, { marginTop: 16 }]}>
                    <TouchableOpacity 
                        style={[styles.logoutButton, { backgroundColor: colors.errorBg + '20', borderColor: colors.errorText + '40' }]}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={20} color={colors.errorText} style={{ marginRight: 8 }} />
                        <Text style={[styles.logoutText, { color: colors.errorText }]}>Déconnexion</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    scrollContent: { padding: 20 },
    
    photoSection: { alignItems: 'center', marginBottom: 32 },
    photoContainer: { position: 'relative', marginBottom: 16 },
    photo: { width: 120, height: 120, borderRadius: 60 },
    photoPlaceholder: { width: 120, height: 120, borderRadius: 60, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    editBadge: { position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: '#00000000', alignItems: 'center', justifyContent: 'center' },
    userName: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
    
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
    card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
    infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    infoIconContainer: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
    infoValue: { fontSize: 15, fontWeight: '500' },
    
    readOnlyWarning: { fontSize: 13, marginBottom: 16, fontStyle: 'italic' },
    
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
    logoutText: { fontSize: 16, fontWeight: '700' }
});

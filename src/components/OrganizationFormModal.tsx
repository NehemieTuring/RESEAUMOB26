/**
 * FleetMan Mobile - Organization Form Modal
 * Form to update organization details (Name and Logo)
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { CreateModal, FormField } from './CreateModal';
import { FormInput } from './FormInput';
import { organizationApi } from '../services/authApi';
import apiClient from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface OrganizationFormModalProps {
    visible: boolean;
    orgId: number;
    initialData: {
        name: string;
        logo: string | null;
        phone?: string;
        address?: string;
        city?: string;
        country?: string;
    };
    onClose: () => void;
    onSuccess: (updatedOrg: any) => void;
}

export const OrganizationFormModal: React.FC<OrganizationFormModalProps> = ({
    visible,
    orgId,
    initialData,
    onClose,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);
    const [orgName, setOrgName] = useState(initialData.name);
    const [orgPhone, setOrgPhone] = useState(initialData.phone || '');
    const [orgAddress, setOrgAddress] = useState(initialData.address || '');
    const [orgCity, setOrgCity] = useState(initialData.city || '');
    const [selectedLogoUri, setSelectedLogoUri] = useState<string | null>(null);
    const [currentLogo, setCurrentLogo] = useState<string | null>(initialData.logo);

    useEffect(() => {
        setOrgName(initialData.name);
        setOrgPhone(initialData.phone || '');
        setOrgAddress(initialData.address || '');
        setOrgCity(initialData.city || '');
        setCurrentLogo(initialData.logo);
        setSelectedLogoUri(null);
    }, [initialData, visible]);

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('common.error'), 'Permission d\'accès à la galerie refusée');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setSelectedLogoUri(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!orgName.trim()) {
            Alert.alert(t('common.error'), 'Le nom de l\'organisation est requis');
            return;
        }

        setLoading(true);
        try {
            // Le profil societe est porte par le gestionnaire connecte :
            // PUT /v1/fleet-managers/me/company.
            let logoUrl: string | undefined;
            if (selectedLogoUri) {
                const up = await apiClient.uploadFile<{ fileUrl: string }>(
                    '/v1/files/upload?category=logo',
                    selectedLogoUri,
                    'image/jpeg',
                    'logo.jpg'
                );
                logoUrl = up?.fileUrl;
            }

            const updatedOrg = await organizationApi.updateCompany({
                companyName: orgName,
                companyPhone: orgPhone,
                companyAddress: orgAddress,
                companyCity: orgCity,
                companyLogoUrl: logoUrl,
            });

            onSuccess(updatedOrg);
            Alert.alert(t('common.success'), 'Informations mises à jour avec succès');
        } catch (error: any) {
            console.error('Update failed:', error);
            Alert.alert(t('common.error'), 'Échec de la mise à jour des informations');
        } finally {
            setLoading(false);
        }
    };

    return (
        <CreateModal
            visible={visible}
            onClose={onClose}
            title="Organisation"
            onSubmit={handleSubmit}
            loading={loading}
            submitText="Enregistrer"
            cancelText="Annuler"
        >
            <View style={styles.container}>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Modifiez les informations et le logo de votre organisation.
                </Text>

                {/* Logo Preview & Picker */}
                <View style={styles.logoSection}>
                    <TouchableOpacity
                        style={[styles.logoPreview, { borderColor: colors.borderGlass, backgroundColor: colors.surfaceGlass }]}
                        onPress={handlePickImage}
                    >
                        {(selectedLogoUri || currentLogo) ? (
                            <Image source={{ uri: selectedLogoUri || currentLogo! }} style={styles.image} />
                        ) : (
                            <View style={styles.placeholder}>
                                <Ionicons name="business" size={40} color={colors.textMuted} />
                            </View>
                        )}
                        <View style={[styles.editBadge, { backgroundColor: colors.primaryBlue }]}>
                            <Ionicons name="camera" size={16} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.logoLabel, { color: colors.textMuted }]}>Cliquez pour changer le logo</Text>
                </View>

                {/* Form Fields */}
                <FormField label="Nom de l'organisation *" required>
                    <FormInput
                        placeholder="Nom"
                        value={orgName}
                        onChangeText={setOrgName}
                    />
                </FormField>

                <FormField label="Téléphone">
                    <FormInput
                        placeholder="+237 ..."
                        value={orgPhone}
                        onChangeText={(text) => setOrgPhone(text.replace(/[^0-9+]/g, ''))}
                        keyboardType="phone-pad"
                    />
                </FormField>

                <FormField label="Adresse">
                    <FormInput
                        placeholder="Adresse"
                        value={orgAddress}
                        onChangeText={setOrgAddress}
                    />
                </FormField>

                <FormField label="Ville">
                    <FormInput
                        placeholder="Ville"
                        value={orgCity}
                        onChangeText={setOrgCity}
                    />
                </FormField>
            </View>
        </CreateModal>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 24,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoPreview: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderStyle: 'dashed',
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    logoLabel: {
        marginTop: 10,
        fontSize: 12,
        fontWeight: '500',
    },
});

export default OrganizationFormModal;

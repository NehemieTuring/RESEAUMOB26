/**
 * FleetMan Mobile - Register Screen
 * Matches the React web frontend design (Single Page Form)
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    ImageBackground,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput,
    StatusBar,
    Image,
    Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { PageHeader } from '../../src/components';
import * as DocumentPicker from 'expo-document-picker';
import { authApi } from '../../src/services';
import apiClient from '../../src/services/api';

export default function RegisterScreen() {
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    
    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Document state
    const [docType, setDocType] = useState('CNI du promoteur *');
    const [showDocTypePicker, setShowDocTypePicker] = useState(false);
    const docTypeOptions = [
        'CNI du promoteur *',
        'Extrait casier judiciaire *',
        'Justificatif de domicile',
        'Immatriculation entreprise',
        'Autre document'
    ];
    const [docNumber, setDocNumber] = useState('');
    const [docIssuer, setDocIssuer] = useState('');
    const [document, setDocument] = useState<any>(null);
    const [documentsList, setDocumentsList] = useState<any[]>([]);
    
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState(false);

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/jpeg', 'image/png'],
            });
            
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setDocument(result.assets[0]);
            }
        } catch (error) {
            console.error("Error picking document:", error);
        }
    };

    const handleAddDocument = () => {
        if (!document) {
            Alert.alert("Erreur", "Veuillez sélectionner un fichier.");
            return;
        }
        if (documentsList.length >= 10) {
            Alert.alert("Erreur", "Maximum 10 documents.");
            return;
        }
        setDocumentsList(prev => [...prev, {
            docType,
            docNumber: docNumber || `DOC-${prev.length + 1}`,
            docIssuer,
            file: document
        }]);
        setDocNumber('');
        setDocIssuer('');
        setDocument(null);
    };

    const handleSubmit = async () => {
        setFormError(null);

        if (!acceptTerms) {
            setFormError("Vous devez accepter les CGU et la politique de confidentialité.");
            return;
        }
        
        if (!firstName || !lastName || !companyName || !email || !phone || !password || !confirmPassword) {
            setFormError("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        // Retirer le + pour compter uniquement les chiffres si jamais il y a le préfixe
        const phoneDigits = phone.replace(/[^0-9]/g, '');
        if (phoneDigits.length !== 9) {
            setFormError("Le numéro de téléphone doit contenir exactement 9 chiffres.");
            return;
        }

        if (password !== confirmPassword) {
            setFormError("Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);
        try {
            // 1. Upload documents
            const uploadedDocuments = await Promise.all(
                documentsList.map(async (d: any) => {
                    const up: any = await apiClient.uploadFile('/v1/files/upload?category=subscription', d.file.uri, d.file.mimeType, d.file.name);
                    return {
                        docType: d.docType,
                        docNumber: d.docNumber,
                        fileUrl: up.fileUrl,
                        fileMimeType: up.mimeType || d.file.mimeType,
                        fileOriginalName: up.originalName || d.file.name,
                        issuer: d.docIssuer || undefined,
                    };
                })
            );

            // 2. Prepare payload
            const payload = {
                // Suffixe court derive de l'email pour garantir l'unicite du username
                // (le backend impose une contrainte unique ; deux "prenom.nom" identiques
                //  provoquaient sinon une erreur d'integrite 400).
                username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/\s+/g, "")
                    + "." + email.trim().toLowerCase().split("@")[0].slice(0, 6),
                password,
                email,
                phone: phoneDigits,
                firstName,
                lastName,
                companyName,
                documents: uploadedDocuments
            };

            // 3. Register
            await authApi.registerManager(payload);

            setLoading(false);
            
            // Réinitialiser le formulaire
            setFirstName('');
            setLastName('');
            setCompanyName('');
            setEmail('');
            setPhone('');
            setPassword('');
            setConfirmPassword('');
            setDocumentsList([]);
            setAcceptTerms(false);

            setFormSuccess(true);
        } catch (e: any) {
            setLoading(false);
            setFormError(e.message || "Une erreur est survenue");
        }
    };

    return (
        <ImageBackground 
            source={require('../../assets/images/login-truck-highway.jpg')} 
            style={[styles.container, { backgroundColor: colors.primaryDark }]}
            imageStyle={{ opacity: isDarkMode ? 0.8 : 0.7 }}
        >
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={isDarkMode ? ['rgba(9, 9, 11, 0.6)', 'rgba(15, 23, 42, 0.7)', 'rgba(9, 9, 11, 0.8)'] : ['rgba(248, 250, 252, 0.3)', 'rgba(255, 255, 255, 0.2)', 'rgba(241, 245, 249, 0.4)']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <PageHeader />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header Logo */}
                    <View style={styles.headerLogoContainer}>
                        <Image 
                            source={require('../../assets/images/logo-fleetman.png')} 
                            style={{ width: 160, height: 45, resizeMode: 'contain', tintColor: '#ffffff' }}
                        />
                        <Text style={[styles.headerSubtitle, { color: '#ffffff' }]}>
                            Votre flotte sous contrôle
                        </Text>
                    </View>

                    {formSuccess ? (
                        <View style={[
                            styles.formCard,
                            {
                                backgroundColor: isDarkMode ? colors.surfaceCard : 'rgba(225, 228, 232, 0.95)',
                                borderColor: colors.borderGlass,
                                alignItems: 'center',
                                paddingVertical: 40
                            }
                        ]}>
                            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                <Ionicons name="checkmark-circle" size={50} color="#22c55e" />
                            </View>
                            <Text style={[styles.formTitle, { color: colors.textPrimary, textAlign: 'center' }]}>Félicitations !</Text>
                            <Text style={[styles.formSubtitle, { color: colors.textSecondary, textAlign: 'center', marginBottom: 30, paddingHorizontal: 10 }]}>
                                Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter en tant qu'Administrateur de votre flotte.
                            </Text>
                            
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.submitButton, { backgroundColor: '#3b82f6', width: '100%' }]}
                                onPress={() => router.replace('/(auth)/login')}
                            >
                                <Text style={styles.submitButtonText}>Aller à la page de connexion</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={[
                            styles.formCard,
                            {
                                backgroundColor: isDarkMode ? colors.surfaceCard : 'rgba(225, 228, 232, 0.95)',
                                borderColor: colors.borderGlass,
                            }
                        ]}>
                            <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Rejoignez FleetMan</Text>
                            <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>Créez votre compte gestionnaire de flotte</Text>

                            {/* Name Row */}
                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                                    <Text style={[styles.label, { color: colors.textPrimary }]}>Prénom *</Text>
                                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.surfaceGlass : '#f0f3f5', borderColor: colors.borderGlass }]}>
                                        <TextInput style={[styles.input, { color: colors.textPrimary }]} value={firstName} onChangeText={setFirstName} />
                                    </View>
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: colors.textPrimary }]}>Nom *</Text>
                                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.surfaceGlass : '#f0f3f5', borderColor: colors.borderGlass }]}>
                                        <TextInput style={[styles.input, { color: colors.textPrimary }]} value={lastName} onChangeText={setLastName} />
                                    </View>
                                </View>
                            </View>

                            {/* Company Name */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textPrimary }]}>Nom entreprise *</Text>
                                <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.surfaceGlass : '#f0f3f5', borderColor: colors.borderGlass }]}>
                                    <TextInput style={[styles.input, { color: colors.textPrimary }]} placeholder="Transport Express CM" placeholderTextColor={colors.textMuted} value={companyName} onChangeText={setCompanyName} />
                                </View>
                            </View>

                            {/* Email */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textPrimary }]}>Email *</Text>
                                <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.surfaceGlass : '#f0f3f5', borderColor: colors.borderGlass }]}>
                                    <TextInput style={[styles.input, { color: colors.textPrimary }]} placeholder="root" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                                </View>
                            </View>

                            {/* Phone */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textPrimary }]}>Téléphone *</Text>
                                <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.surfaceGlass : '#f0f3f5', borderColor: colors.borderGlass }]}>
                                    <TextInput style={[styles.input, { color: colors.textPrimary }]} placeholder="6XX XX XX XX" placeholderTextColor={colors.textMuted} value={phone} onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))} keyboardType="phone-pad" maxLength={9} />
                                </View>
                            </View>

                            {/* Password */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textPrimary }]}>Mot de passe *</Text>
                                <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.surfaceGlass : '#f0f3f5', borderColor: colors.borderGlass }]}>
                                    <TextInput style={[styles.input, { color: colors.textPrimary }]} placeholder="••••" placeholderTextColor={colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.passwordRules}>
                                    <Text style={styles.ruleText}>× 8 caractères minimum</Text>
                                    <Text style={styles.ruleText}>× Une majuscule</Text>
                                    <Text style={styles.ruleText}>× Un chiffre</Text>
                                </View>
                            </View>

                            {/* Confirm Password */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textPrimary }]}>Confirmer le mot de passe *</Text>
                                <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.surfaceGlass : '#f0f3f5', borderColor: colors.borderGlass }]}>
                                    <TextInput style={[styles.input, { color: colors.textPrimary }]} secureTextEntry={!showConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
                                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Documents Section */}
                            <View style={styles.documentsSection}>
                                <View style={styles.docHeader}>
                                    <Ionicons name="document-text-outline" size={20} color={colors.textPrimary} />
                                    <Text style={[styles.docTitle, { color: colors.textPrimary }]}>Documents de conformité</Text>
                                </View>
                                <Text style={[styles.docSubtitle, { color: colors.textSecondary }]}>
                                    Fournissez jusqu'à 10 documents (CNI et casier judiciaire obligatoires).
                                </Text>
                                
                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                                        <Text style={[styles.label, { color: colors.textPrimary, fontSize: 12 }]}>Type de document</Text>
                                        <TouchableOpacity 
                                            style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.surfaceCard : '#ffffff', borderColor: colors.borderGlass, paddingVertical: 12 }]}
                                            onPress={() => setShowDocTypePicker(true)}
                                        >
                                            <Text style={{ flex: 1, color: colors.textPrimary }}>{docType}</Text>
                                            <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={[styles.label, { color: colors.textPrimary, fontSize: 12 }]}>N° document</Text>
                                        <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.surfaceGlass : '#f0f3f5', borderColor: colors.borderGlass }]}>
                                            <TextInput style={[styles.input, { color: colors.textPrimary }]} placeholder="Référence" placeholderTextColor={colors.textMuted} value={docNumber} onChangeText={setDocNumber} />
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                                        <Text style={[styles.label, { color: colors.textPrimary, fontSize: 12 }]}>Émetteur</Text>
                                        <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? colors.surfaceGlass : '#f0f3f5', borderColor: colors.borderGlass }]}>
                                            <TextInput style={[styles.input, { color: colors.textPrimary }]} placeholder="Organisme" placeholderTextColor={colors.textMuted} value={docIssuer} onChangeText={setDocIssuer} />
                                        </View>
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={[styles.label, { color: colors.textPrimary, fontSize: 12 }]}>Fichier (PDF, JPEG, PNG)</Text>
                                        <TouchableOpacity style={[styles.fileButton, { backgroundColor: isDarkMode ? colors.surfaceCard : '#ffffff' }]} onPress={handlePickDocument}>
                                            <Text style={[styles.fileButtonText, { color: colors.textPrimary }]} numberOfLines={1}>
                                                {document ? document.name : 'Choisir un fichier...'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.addDocButton} onPress={handleAddDocument}>
                                    <Ionicons name="add-circle-outline" size={18} color={colors.textPrimary} />
                                    <Text style={[styles.addDocButtonText, { color: colors.textPrimary }]}>Ajouter le document ({documentsList.length}/10)</Text>
                                </TouchableOpacity>

                                {documentsList.length > 0 && (
                                    <View style={{ marginTop: 16, gap: 8 }}>
                                        {documentsList.map((doc, idx) => (
                                            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: isDarkMode ? colors.surfaceCard : '#ffffff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.borderGlass }}>
                                                <View style={{ flex: 1, marginRight: 8 }}>
                                                    <Text style={{ color: colors.textPrimary, fontWeight: '500', fontSize: 13 }} numberOfLines={1}>{doc.docType}</Text>
                                                    <Text style={{ color: colors.textMuted, fontSize: 12 }} numberOfLines={1}>{doc.file.name}</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => setDocumentsList(prev => prev.filter((_, i) => i !== idx))} style={{ padding: 4 }}>
                                                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Document Type Picker Modal */}
                            <Modal visible={showDocTypePicker} transparent={true} animationType="fade">
                                <TouchableOpacity 
                                    style={styles.modalOverlay} 
                                    activeOpacity={1} 
                                    onPress={() => setShowDocTypePicker(false)}
                                >
                                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? colors.surfaceCard : '#ffffff' }]}>
                                        {docTypeOptions.map((option, index) => (
                                            <TouchableOpacity 
                                                key={index} 
                                                style={[styles.modalOption, index < docTypeOptions.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderGlass }]}
                                                onPress={() => {
                                                    setDocType(option);
                                                    setShowDocTypePicker(false);
                                                }}
                                            >
                                                <Text style={[styles.modalOptionText, { color: docType === option ? '#3b82f6' : colors.textPrimary, fontWeight: docType === option ? '600' : '400' }]}>
                                                    {option}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </TouchableOpacity>
                            </Modal>

                            {/* CGU Checkbox */}
                            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAcceptTerms(!acceptTerms)}>
                                <View style={[styles.checkbox, acceptTerms && styles.checkboxActive, { borderColor: acceptTerms ? '#3b82f6' : colors.borderGlass, backgroundColor: acceptTerms ? '#3b82f6' : 'transparent' }]}>
                                    {acceptTerms && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                                </View>
                                <Text style={[styles.checkboxText, { color: colors.textSecondary }]}>
                                    J'accepte les CGU et la politique de confidentialité
                                </Text>
                            </TouchableOpacity>

                            {formError && (
                                <View style={{ backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="alert-circle" size={20} color="#ef4444" style={{ marginRight: 8 }} />
                                    <Text style={{ color: '#b91c1c', fontSize: 14, flex: 1 }}>{formError}</Text>
                                </View>
                            )}

                            {/* Submit Button */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.submitButton, { backgroundColor: '#3b82f6', opacity: acceptTerms ? 1 : 0.6 }]}
                                onPress={handleSubmit}
                                disabled={loading || !acceptTerms}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Soumettre ma demande</Text>
                                )}
                            </TouchableOpacity>

                            {/* Login Link */}
                            <View style={styles.loginContainer}>
                                <Text style={[styles.loginText, { color: colors.textSecondary }]}>Déjà inscrit ? </Text>
                                <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                                    <Text style={styles.loginLink}>Se connecter</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Footer */}
                    <Text style={styles.footerText}>
                        © 2026 FleetMan. Tous droits réservés.
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, width: '100%', minHeight: '100%' },
    keyboardView: { flex: 1, width: '100%' },
    scrollView: { flex: 1 },
    scrollContent: { flexGrow: 1, alignItems: 'center', padding: 20, paddingTop: 60, paddingBottom: 40 },
    headerLogoContainer: { alignItems: 'center', marginBottom: 30 },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerLogoText: { fontSize: 24, fontWeight: '800' },
    headerSubtitle: { fontSize: 13, marginTop: 4, opacity: 0.9 },
    formCard: { 
        width: '100%',
        maxWidth: 550,
        borderRadius: 20, 
        padding: 24, 
        borderWidth: 1,
        marginBottom: 20
    },
    formTitle: { fontSize: 24, fontWeight: '700', marginBottom: 6, letterSpacing: -0.5 },
    formSubtitle: { fontSize: 14, marginBottom: 24 },
    row: { flexDirection: 'row' },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '700', marginLeft: 2, marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1 },
    input: { flex: 1, paddingVertical: 12, fontSize: 14 },
    passwordRules: { marginTop: 8, paddingLeft: 4 },
    ruleText: { fontSize: 11, color: '#64748b', marginBottom: 2 },
    documentsSection: {
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 16,
        padding: 16,
        marginTop: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)'
    },
    docHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
    docTitle: { fontSize: 15, fontWeight: '600' },
    docSubtitle: { fontSize: 13, marginBottom: 16, lineHeight: 18 },
    fileButton: { 
        borderRadius: 12, 
        paddingHorizontal: 12, 
        paddingVertical: 12, 
        borderWidth: 1, 
        borderColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center'
    },
    fileButtonText: { fontSize: 13, fontWeight: '500' },
    addDocButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        borderRadius: 20,
        marginTop: 8,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)'
    },
    addDocButtonText: { fontSize: 13, fontWeight: '600' },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingRight: 20 },
    checkbox: { 
        width: 18, 
        height: 18, 
        borderRadius: 4, 
        borderWidth: 1.5, 
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    checkboxActive: { borderWidth: 0 },
    checkboxText: { fontSize: 13, lineHeight: 18 },
    submitButton: { paddingVertical: 16, borderRadius: 24, alignItems: 'center', marginBottom: 20 },
    submitButtonText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
    loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    loginText: { fontSize: 14 },
    loginLink: { fontSize: 14, fontWeight: '600', color: '#3b82f6' },
    footerText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 'auto' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: '80%',
        maxWidth: 400,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84
    },
    modalOption: {
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    modalOptionText: {
        fontSize: 15,
    },
});

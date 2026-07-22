import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { DashboardHeader, Card, Button } from '../../src/components';

export default function DriverIncidentsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  
  const [incidentType, setIncidentType] = useState('accident');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez décrire l\'incident.');
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert('Succès', 'Votre incident a été signalé avec succès.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }, 1500);
  };

  const IncidentTypeOption = ({ type, icon, label, color }: any) => {
    const isSelected = incidentType === type;
    return (
      <TouchableOpacity 
        style={[
          styles.typeOption, 
          { backgroundColor: colors.surfaceCard, borderColor: isSelected ? color : colors.borderGlass },
          isSelected && { borderWidth: 2 }
        ]} 
        onPress={() => setIncidentType(type)}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <Text style={[styles.typeLabel, { color: isSelected ? color : colors.textPrimary, fontWeight: isSelected ? '700' : '500' }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryDark }]} edges={['top']}>
      {isDarkMode && (
        <LinearGradient
          colors={[colors.primaryDark, '#0f172a', colors.primaryDark]}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      
      <DashboardHeader 
        showSearch={false}
      />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Signaler un incident</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Type d'incident</Text>
        
        <View style={styles.typeGrid}>
          <IncidentTypeOption type="accident" icon="car-sport" label="Accident" color={colors.errorText} />
          <IncidentTypeOption type="breakdown" icon="build" label="Panne" color={colors.accentOrange} />
          <IncidentTypeOption type="fuel" icon="water" label="Carburant" color={colors.primaryCyan} />
          <IncidentTypeOption type="other" icon="alert-circle" label="Autre" color={colors.textMuted} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Description</Text>
        <Card style={styles.inputCard}>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.borderGlass }]}
            placeholder="Décrivez l'incident en détail..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </Card>

        <Button 
          title="Soumettre le rapport" 
          onPress={handleSubmit} 
          variant="primary" 
          disabled={isSubmitting}
          style={styles.submitBtn} 
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 8, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 16, padding: 4 },
  title: { fontSize: 22, fontWeight: '800' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  typeOption: { width: '48%', padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginBottom: 16 },
  iconContainer: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  typeLabel: { fontSize: 14, textAlign: 'center' },
  inputCard: { padding: 16, marginBottom: 24 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 15, minHeight: 120 },
  submitBtn: { marginTop: 8 },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { DashboardHeader, Card, Button } from '../../src/components';
import { vehicleApi, Vehicle } from '../../src/services/vehicleApi';
import { incidentApi, IncidentCreate, IncidentType, IncidentSeverity } from '../../src/services/incidentApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DriverIncidentsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  
  const [incidentType, setIncidentType] = useState<string>('ACCIDENT');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [driverId, setDriverId] = useState<string>('');

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const userStr = await AsyncStorage.getItem('@fleetman_user_data');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setDriverId(userData.userId);
          
          if (userData.vehicleId) {
            try {
              const vehicle = await vehicleApi.getById(userData.vehicleId);
              setVehicles([vehicle]);
              setSelectedVehicleId(vehicle.vehicleId);
              return; // We found the assigned vehicle, stop here
            } catch (err) {
              console.error('Error fetching driver specific vehicle:', err);
            }
          }
        }
        
        // Fallback for managers/admins or if no vehicleId is found
        const vehicleList = await vehicleApi.getAll();
        setVehicles(vehicleList);
        if (vehicleList.length > 0) {
          setSelectedVehicleId(vehicleList[0].vehicleId);
        }
      } catch (err) {
        console.error('Error loading data for incidents:', err);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async () => {
    console.log('handleSubmit called', { selectedVehicleId, description, driverId });
    if (!selectedVehicleId) {
      console.log('Validation failed: No vehicle selected');
      Alert.alert('Erreur', 'Veuillez sélectionner un véhicule.');
      return;
    }
    if (!description.trim()) {
      console.log('Validation failed: No description');
      Alert.alert('Erreur', 'Veuillez décrire l\'incident.');
      return;
    }
    
    setIsSubmitting(true);
    console.log('Validation passed, creating incident...');
    try {
      const newIncident: any = {
        type: incidentType,
        description: description,
        severity: 'MEDIUM',
        status: 'REPORTED',
        vehicleId: selectedVehicleId,
      };
      
      if (driverId) {
        newIncident.driverId = driverId;
      }
      
      await incidentApi.create(newIncident);
      Alert.alert('Succès', 'Votre incident a été signalé avec succès.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err) {
      console.error('Submit incident error:', err);
      Alert.alert('Erreur', 'Impossible de signaler l\'incident.');
    } finally {
      setIsSubmitting(false);
    }
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

        <Text style={[styles.title, { color: colors.textPrimary }]}>Signaler un incident</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Type d'incident</Text>
        
        <View style={styles.typeGrid}>
          <IncidentTypeOption type="ACCIDENT" icon="car-sport" label="Accident" color={colors.errorText} />
          <IncidentTypeOption type="BREAKDOWN" icon="build" label="Panne" color={colors.accentOrange} />
          <IncidentTypeOption type="OTHER" icon="alert-circle" label="Autre" color={colors.textMuted} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Véhicule concerné</Text>
        {vehicles.length === 0 ? (
          <Text style={{ color: colors.textMuted, marginBottom: 20 }}>Aucun véhicule disponible.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleScroll} contentContainerStyle={styles.vehicleScrollContent}>
            {vehicles.map((v) => {
              const isSelected = selectedVehicleId === v.vehicleId;
              return (
                <TouchableOpacity
                  key={v.vehicleId}
                  style={[
                    styles.vehicleCard,
                    { backgroundColor: colors.surfaceCard, borderColor: isSelected ? colors.primaryBlue : colors.borderGlass },
                    isSelected && { borderWidth: 2 }
                  ]}
                  onPress={() => setSelectedVehicleId(v.vehicleId)}
                >
                  <Ionicons name="car" size={24} color={isSelected ? colors.primaryBlue : colors.textMuted} />
                  <Text style={[styles.vehicleText, { color: isSelected ? colors.primaryBlue : colors.textPrimary }]}>
                    {v.vehicleRegistrationNumber || (v as any).licensePlate || (v as any).registrationNumber || 'Plaque Inconnue'}
                  </Text>
                  <Text style={[styles.vehicleMake, { color: colors.textMuted }]}>
                    {v.vehicleMake || (v as any).brand || (v as any).make || 'Marque Inconnue'} {v.vehicleModel || (v as any).model || 'Modèle Inconnu'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

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
  typeOption: { width: '31%', padding: 12, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginBottom: 16 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  typeLabel: { fontSize: 13, textAlign: 'center' },
  vehicleScroll: { marginBottom: 24 },
  vehicleScrollContent: { paddingRight: 16 },
  vehicleCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginRight: 12, width: 140, alignItems: 'center' },
  vehicleText: { fontSize: 14, fontWeight: '700', marginTop: 8 },
  vehicleMake: { fontSize: 12, marginTop: 4 },
  inputCard: { padding: 16, marginBottom: 24 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 15, minHeight: 120 },
  submitBtn: { marginTop: 8 },
});

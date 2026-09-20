import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { DashboardHeader, Button, FleetMap } from '../../src/components';

export default function DriverMapScreen() {
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();

  const handleSendPosition = () => {
    Alert.alert('Position envoyée', 'Votre position actuelle a été transmise au gestionnaire de flotte.');
  };

  // Coordonnées factices pour l'exemple
  const initialRegion = {
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryDark }]} edges={['top']}>
      {isDarkMode && (
        <LinearGradient
          colors={[colors.primaryDark, '#0f172a', colors.primaryDark]}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      
      <DashboardHeader showSearch={false} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Ma Position (GPS)</Text>
      </View>

      <View style={styles.mapContainer}>
        <FleetMap
          style={styles.map}
          initialRegion={initialRegion}
          showUserLocation={true}
          vehicles={[{ id: 1, name: 'Ma Position', latitude: 48.8566, longitude: 2.3522, status: 'moving' }]}
        />
      </View>

      <View style={[styles.footer, { backgroundColor: colors.surfaceCard, borderTopColor: colors.borderGlass }]}>
        <Button 
          title="Envoyer ma position" 
          variant="primary" 
          onPress={handleSendPosition} 
          icon={<Ionicons name="location" size={20} color="white" style={{marginRight: 8}} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 8, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 16, padding: 4 },
  title: { fontSize: 22, fontWeight: '800' },
  
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    marginTop: -24,
  },
});

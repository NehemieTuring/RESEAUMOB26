/**
 * FleetMan Mobile - Driver Home Screen
 * Dashboard for drivers (Vues 2.1 & 2.2)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { DashboardHeader, Card, Button } from '../../src/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../src/services/api';

export default function DriverHomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [fuelLevel, setFuelLevel] = useState<number>(75); // Mock
  const [lastPosition, setLastPosition] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState<number>(3); // Mock
  
  const [inAlarm, setInAlarm] = useState(false);

  const loadData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const userData = userStr ? JSON.parse(userStr) : { fullName: 'Conducteur' };
      setUser(userData);
      
      // Mock API calls for fluid navigation as requested
      const vehicleData = await apiClient.get<any>(`/api/drivers/${userData.userId}/vehicle`);
      setVehicle(vehicleData.id ? vehicleData : { brand: 'Toyota', model: 'Hilux', licensePlate: 'LT-123-AB' });
      
      const tripsData = await apiClient.get<any[]>(`/api/trips/driver/${userData.userId}/active`);
      setActiveTrip(tripsData && tripsData.length > 0 ? tripsData[0] : { reference: 'TRIP-A-001', status: 'IN_PROGRESS' });
      
      const positionsData = await apiClient.get<any[]>(`/api/positions/driver/${userData.userId}?latest=true`);
      setLastPosition(positionsData && positionsData.length > 0 ? positionsData[0] : { lat: 4.0511, lng: 9.7085, timestamp: new Date().toISOString() });
      
      // Check alarm status
      const alarmStatus = await apiClient.get<any>(`/api/drivers/${userData.userId}/alarm-status`);
      if (alarmStatus && alarmStatus.inAlarm) {
        setInAlarm(true);
      }
      
    } catch (error) {
      console.error('Error loading driver dashboard:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const QuickAction = ({ icon, label, onPress, color }: any) => (
    <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.quickActionLabel, { color: colors.textPrimary }]} numberOfLines={2} textBreakStrategy="simple">{label}</Text>
    </TouchableOpacity>
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Maintenant';
    const d = new Date(dateString);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
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
        notificationCount={unreadCount}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryBlue} />}
      >
        {/* Welcome Section */}
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: colors.textMuted }]}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Bonjour, {user?.fullName?.split(' ')[0] || 'Conducteur'} 👋
          </Text>
        </View>

        {/* Alarm Overlay / Banner */}
        {inAlarm && (
          <View style={[styles.alarmBanner, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }]}>
            <View style={styles.alarmHeader}>
              <Ionicons name="warning" size={24} color={colors.errorText} />
              <Text style={[styles.alarmTitle, { color: colors.errorText }]}>ALARME DÉCLENCHÉE</Text>
            </View>
            <Text style={[styles.alarmText, { color: colors.textPrimary }]}>Entrée en zone interdite détectée.</Text>
            <View style={styles.alarmActions}>
              <Button title="Acquitter" onPress={() => setInAlarm(false)} size="small" variant="primary" style={{flex: 1}} />
              <Button title="Voir Carte" onPress={() => router.push('/(driver)/map')} size="small" variant="outline" style={{flex: 1, marginLeft: 8}} />
            </View>
          </View>
        )}

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={[styles.cardTitle, { color: colors.textMuted }]}>Aperçu de la journée</Text>
          
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.primaryBlue + '20' }]}>
              <Ionicons name="car" size={20} color={colors.primaryBlue} />
            </View>
            <View style={styles.summaryTexts}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Véhicule assigné</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                {vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.licensePlate}` : 'Aucun véhicule'}
              </Text>
            </View>
          </View>

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.successText + '20' }]}>
              <Ionicons name="map" size={20} color={colors.successText} />
            </View>
            <View style={styles.summaryTexts}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Trajet en cours</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                {activeTrip ? `${activeTrip.reference} - En cours` : 'Aucun trajet actif'}
              </Text>
            </View>
          </View>

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.accentOrange + '20' }]}>
              <Ionicons name="water" size={20} color={colors.accentOrange} />
            </View>
            <View style={styles.summaryTexts}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Niveau Carburant</Text>
              <View style={styles.fuelContainer}>
                <View style={[styles.fuelBar, { backgroundColor: colors.borderGlass }]}>
                  <View style={[styles.fuelFill, { width: `${fuelLevel}%`, backgroundColor: fuelLevel > 20 ? colors.successText : colors.errorText }]} />
                </View>
                <Text style={[styles.fuelText, { color: colors.textPrimary }]}>{fuelLevel}%</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Actions Rapides</Text>
        <View style={styles.quickActionsContainer}>
          <QuickAction 
            icon="play-circle" 
            label="Démarrer trajet" 
            color={colors.successText} 
            onPress={() => router.push('/(driver)/trips')} 
          />
          <QuickAction 
            icon="location" 
            label="Envoyer position" 
            color={colors.primaryBlue} 
            onPress={() => router.push('/(driver)/map')} 
          />
          <QuickAction 
            icon="warning" 
            label="Signaler incident" 
            color={colors.errorText} 
            onPress={() => router.push('/(driver)/incidents')} 
          />
          <QuickAction 
            icon="map" 
            label="Voir Carte" 
            color={colors.primaryCyan} 
            onPress={() => router.push('/(driver)/map')} 
          />
        </View>

        {/* Last Position */}
        <Card style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Ionicons name="navigate-circle" size={24} color={colors.primaryBlue} />
            <Text style={[styles.locationTitle, { color: colors.textPrimary }]}>Dernière position GPS</Text>
          </View>
          <View style={styles.locationDetails}>
            <Text style={[styles.locationCoords, { color: colors.textMuted }]}>
              Lat: {lastPosition?.lat || 'N/A'}, Lng: {lastPosition?.lng || 'N/A'}
            </Text>
            <Text style={[styles.locationTime, { color: colors.textMuted }]}>
              Mise à jour: {formatDate(lastPosition?.timestamp)}
            </Text>
          </View>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 24 },
  welcomeText: { fontSize: 14, textTransform: 'capitalize', marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '800' },
  
  alarmBanner: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  alarmHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  alarmTitle: { fontSize: 16, fontWeight: '700', marginLeft: 8 },
  alarmText: { fontSize: 14, marginBottom: 12 },
  alarmActions: { flexDirection: 'row' },
  
  summaryCard: { marginBottom: 24, padding: 20 },
  cardTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  summaryIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  summaryTexts: { flex: 1 },
  summaryLabel: { fontSize: 12, marginBottom: 4 },
  summaryValue: { fontSize: 15, fontWeight: '600' },
  
  fuelContainer: { flexDirection: 'row', alignItems: 'center' },
  fuelBar: { flex: 1, height: 8, borderRadius: 4, marginRight: 12, overflow: 'hidden' },
  fuelFill: { height: '100%', borderRadius: 4 },
  fuelText: { fontSize: 13, fontWeight: '600', width: 35 },
  
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  quickActionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  quickAction: { 
    width: '48%', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
    alignItems: 'center', 
    marginBottom: 16 
  },
  quickActionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  quickActionLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  
  locationCard: { padding: 16 },
  locationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  locationTitle: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  locationDetails: { marginLeft: 32 },
  locationCoords: { fontSize: 13, marginBottom: 4 },
  locationTime: { fontSize: 12 },
});

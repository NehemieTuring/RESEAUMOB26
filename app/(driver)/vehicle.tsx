/**
 * FleetMan Mobile - Driver Vehicle Screen
 * Vehicle details and history (Vues 3.1 & 3.2)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { DashboardHeader, Card, Button } from '../../src/components';
import apiClient from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DriverVehicleScreen() {
  const { colors, isDarkMode } = useTheme();
  
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'current' | 'history'>('current');
  const [vehicle, setVehicle] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const userData = userStr ? JSON.parse(userStr) : null;
      if (!userData) return;

      const driverId = userData.id || userData.userId;
      let currentVehicleId = userData.vehicleId;

      try {
        const freshDriver = await apiClient.get<any>('/v1/auth/me');
        currentVehicleId = freshDriver?.vehicleId || null;
        if (currentVehicleId !== userData.vehicleId) {
            userData.vehicleId = currentVehicleId;
            await AsyncStorage.setItem('user', JSON.stringify(userData));
        }
      } catch(e) {
        console.warn("Impossible de rafraichir le profil du chauffeur");
      }

      if (currentVehicleId) {
        try {
          const vehicleData = await apiClient.get<any>(`/v1/vehicles/${currentVehicleId}`);
          const actualVehicle = vehicleData.vehicle || vehicleData;
          const mappedVehicle = {
              id: actualVehicle.vehicleId || actualVehicle.id,
              brand: actualVehicle.brand || actualVehicle.vehicleMake || actualVehicle.make || 'Marque Inconnue',
              model: actualVehicle.model || actualVehicle.vehicleModel || 'Modèle Inconnu',
              year: actualVehicle.manufacturingYear || actualVehicle.year || 2024,
              licensePlate: actualVehicle.licensePlate || actualVehicle.vehicleRegistrationNumber || '-',
              vin: actualVehicle.vehicleSerialNumber || actualVehicle.vehicleIdentificationNumber || actualVehicle.vin || '-',
              type: actualVehicle.vehicleTypeId || actualVehicle.type || 'N/A',
              status: actualVehicle.status || actualVehicle.state || 'IN_SERVICE',
              fuelLevel: actualVehicle.fuelLevel || 0,
              speed: actualVehicle.speed || 0,
              odometer: actualVehicle.odometer || 0,
              engineStatus: 'OK',
              batteryStatus: 'OK',
              lastMaintenance: actualVehicle.createdAt || new Date().toISOString(),
              photoUrl: actualVehicle.vehiclePhotoUrl || actualVehicle.photoUrl || null
          };

          try {
             const opData = await apiClient.get<any>(`/v1/vehicles/${userData.vehicleId}/operational`);
             if (opData) {
                 if (opData.fuelLevel) mappedVehicle.fuelLevel = parseInt(opData.fuelLevel);
                 if (opData.speed) mappedVehicle.speed = parseInt(opData.speed);
                 if (opData.odometer) mappedVehicle.odometer = parseInt(opData.odometer);
             }
          } catch(e) {}

          setVehicle(mappedVehicle);
        } catch (error) {
          console.error('Error fetching real vehicle:', error);
          setVehicle(null);
        }
      } else {
        setVehicle(null);
      }

      setHistory([]);
    } catch (error) {
      console.error('Error in loadData:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_SERVICE': return colors.successText;
      case 'PARKED': return colors.primaryBlue;
      case 'IN_ALARM': return colors.errorText;
      default: return colors.textMuted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'IN_SERVICE': return 'En Service';
      case 'PARKED': return 'Stationné';
      case 'IN_ALARM': return 'En Alarme';
      default: return status;
    }
  };

  const InfoRow = ({ label, value, icon, color = colors.primaryBlue }: any) => (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryDark }]} edges={['top']}>
      {isDarkMode && (
        <LinearGradient colors={[colors.primaryDark, '#0f172a', colors.primaryDark]} style={StyleSheet.absoluteFillObject} />
      )}
      
      <DashboardHeader showSearch={false} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Véhicules</Text>
        <View style={[styles.tabContainer, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
          <TouchableOpacity 
            style={[styles.tab, viewMode === 'current' && [styles.activeTab, { backgroundColor: colors.primaryBlue + '20' }]]} 
            onPress={() => setViewMode('current')}
          >
            <Text style={[styles.tabText, { color: viewMode === 'current' ? colors.primaryBlue : colors.textMuted }]}>Assigné</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, viewMode === 'history' && [styles.activeTab, { backgroundColor: colors.primaryBlue + '20' }]]} 
            onPress={() => setViewMode('history')}
          >
            <Text style={[styles.tabText, { color: viewMode === 'history' ? colors.primaryBlue : colors.textMuted }]}>Historique</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryBlue} />}
      >
        {viewMode === 'current' ? (
          vehicle ? (
            <View>
              {/* Photo & Main Info */}
              <Card style={styles.mainCard}>
                <View style={styles.vehicleHeader}>
                  <View style={[styles.vehiclePhotoPlaceholder, { backgroundColor: colors.borderGlass }]}>
                    <Ionicons name="car" size={40} color={colors.textMuted} />
                  </View>
                  <View style={styles.vehicleTitles}>
                    <Text style={[styles.vehicleBrand, { color: colors.textPrimary }]}>{vehicle.brand} {vehicle.model}</Text>
                    <Text style={[styles.vehiclePlate, { color: colors.textMuted }]}>{vehicle.licensePlate}</Text>
                    <View style={[styles.badge, { backgroundColor: getStatusColor(vehicle.status) + '20' }]}>
                      <Text style={[styles.badgeText, { color: getStatusColor(vehicle.status) }]}>{getStatusLabel(vehicle.status)}</Text>
                    </View>
                  </View>
                </View>
              </Card>

              {/* Operational Data */}
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Données Opérationnelles</Text>
              <Card style={styles.detailsCard}>
                <InfoRow label="Type de véhicule" value={vehicle.type} icon="car-sport" />
                <InfoRow label="Niveau Carburant" value={`${vehicle.fuelLevel}%`} icon="water" color={colors.accentOrange} />
                <InfoRow label="Vitesse actuelle" value={`${vehicle.speed} km/h`} icon="speedometer" color={colors.primaryCyan} />
                <InfoRow label="Kilométrage total" value={`${vehicle.odometer.toLocaleString('fr-FR')} km`} icon="map" />
              </Card>

              {/* Technical Data */}
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Informations Techniques</Text>
              <Card style={styles.detailsCard}>
                <InfoRow label="Numéro de châssis (VIN)" value={vehicle.vin} icon="barcode" />
                <InfoRow label="Année" value={vehicle.year} icon="calendar" />
                <InfoRow label="État du Moteur" value={vehicle.engineStatus} icon="construct" color={vehicle.engineStatus === 'OK' ? colors.successText : colors.errorText} />
                <InfoRow label="État Batterie" value={vehicle.batteryStatus} icon="battery-full" color={vehicle.batteryStatus === 'OK' ? colors.successText : colors.errorText} />
                <InfoRow label="Dernière révision" value={new Date(vehicle.lastMaintenance).toLocaleDateString('fr-FR')} icon="build" />
              </Card>
              
              <Button title="Historique des maintenances" variant="outline" onPress={() => {}} style={styles.maintenanceBtn} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={60} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textPrimary }]}>Aucun véhicule assigné actuellement.</Text>
            </View>
          )
        ) : (
          <View>
            {history.map((item, index) => (
              <Card key={index} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>{item.brand} {item.model}</Text>
                  <Text style={[styles.historyPlate, { color: colors.textMuted }]}>{item.licensePlate}</Text>
                </View>
                <View style={[styles.historyDivider, { backgroundColor: colors.borderGlass }]} />
                <View style={styles.historyDates}>
                  <View>
                    <Text style={[styles.historyLabel, { color: colors.textMuted }]}>Début d'affectation</Text>
                    <Text style={[styles.historyValue, { color: colors.textPrimary }]}>{new Date(item.startDate).toLocaleDateString('fr-FR')}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.historyLabel, { color: colors.textMuted }]}>Fin d'affectation</Text>
                    <Text style={[styles.historyValue, { color: colors.textPrimary }]}>{item.endDate ? new Date(item.endDate).toLocaleDateString('fr-FR') : 'En cours'}</Text>
                  </View>
                </View>
                <View style={styles.historyStats}>
                  <Ionicons name="map" size={16} color={colors.primaryBlue} style={{ marginRight: 6 }} />
                  <Text style={[styles.historyValue, { color: colors.textPrimary }]}>Distance parcourue : {item.distance.toLocaleString('fr-FR')} km</Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 8 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  
  tabContainer: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: {},
  tabText: { fontSize: 14, fontWeight: '600' },
  
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  
  mainCard: { padding: 16, marginBottom: 24 },
  vehicleHeader: { flexDirection: 'row', alignItems: 'center' },
  vehiclePhotoPlaceholder: { width: 80, height: 80, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  vehicleTitles: { flex: 1, justifyContent: 'center' },
  vehicleBrand: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  vehiclePlate: { fontSize: 14, marginBottom: 8 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  
  detailsCard: { padding: 16, marginBottom: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600' },
  
  maintenanceBtn: { marginBottom: 20 },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { fontSize: 16, marginTop: 16, textAlign: 'center' },
  
  historyCard: { padding: 16, marginBottom: 16 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  historyTitle: { fontSize: 16, fontWeight: '700' },
  historyPlate: { fontSize: 14, fontWeight: '600' },
  historyDivider: { height: 1, width: '100%', marginBottom: 12 },
  historyDates: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  historyLabel: { fontSize: 12, marginBottom: 4 },
  historyValue: { fontSize: 14, fontWeight: '500' },
  historyStats: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
});

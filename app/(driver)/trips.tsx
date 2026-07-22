import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { DashboardHeader, Card, Button } from '../../src/components';
import { useRouter } from 'expo-router';

export default function DriverTripsScreen() {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  
  const [refreshing, setRefreshing] = useState(false);

  const activeTrip = {
    id: 1,
    reference: 'TRP-2024-001',
    startLocation: 'Dépôt Central',
    endLocation: 'Client Alpha',
    status: 'IN_PROGRESS',
    startTime: '10:00',
  };

  const tripsHistory = [
    { id: 2, reference: 'TRP-2024-002', date: '12 Oct 2024', time: '14:00 - 16:30', status: 'COMPLETED' },
    { id: 3, reference: 'TRP-2024-003', date: '11 Oct 2024', time: '09:00 - 11:15', status: 'COMPLETED' },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
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
        <Text style={[styles.title, { color: colors.textPrimary }]}>Mes Trajets</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryBlue} />}
      >
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Course active</Text>
        
        {activeTrip ? (
          <Card style={styles.activeTripCard}>
            <View style={styles.tripHeader}>
              <Text style={[styles.tripRef, { color: colors.textPrimary }]}>{activeTrip.reference}</Text>
              <View style={[styles.badge, { backgroundColor: colors.primaryBlue + '20' }]}>
                <Text style={[styles.badgeText, { color: colors.primaryBlue }]}>En cours</Text>
              </View>
            </View>
            
            <View style={styles.tripRoute}>
              <View style={styles.routeNode}>
                <Ionicons name="radio-button-on" size={16} color={colors.primaryBlue} />
                <Text style={[styles.routeText, { color: colors.textPrimary }]}>{activeTrip.startLocation}</Text>
              </View>
              <View style={[styles.routeLine, { borderLeftColor: colors.borderGlass }]} />
              <View style={styles.routeNode}>
                <Ionicons name="location" size={16} color={colors.errorText} />
                <Text style={[styles.routeText, { color: colors.textPrimary }]}>{activeTrip.endLocation}</Text>
              </View>
            </View>

            <Button title="Terminer le trajet" variant="primary" onPress={() => {}} style={{ marginTop: 16 }} />
          </Card>
        ) : (
          <Button title="Démarrer un nouveau trajet" variant="primary" onPress={() => {}} style={{ marginBottom: 24 }} />
        )}

        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 16 }]}>Historique des trajets</Text>
        
        {tripsHistory.map((trip) => (
          <Card key={trip.id} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={[styles.historyDate, { color: colors.textMuted }]}>{trip.date}</Text>
              <Text style={[styles.historyStatus, { color: colors.successText }]}>Terminé</Text>
            </View>
            <Text style={[styles.historyRef, { color: colors.textPrimary }]}>{trip.reference}</Text>
            <Text style={[styles.historyTime, { color: colors.textSecondary }]}>{trip.time}</Text>
          </Card>
        ))}

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
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  
  activeTripCard: { padding: 16, marginBottom: 24 },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  tripRef: { fontSize: 16, fontWeight: '700' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  
  tripRoute: { paddingLeft: 8 },
  routeNode: { flexDirection: 'row', alignItems: 'center' },
  routeText: { marginLeft: 12, fontSize: 15, fontWeight: '500' },
  routeLine: { height: 24, borderLeftWidth: 2, marginLeft: 7, marginVertical: 4 },
  
  historyCard: { padding: 16, marginBottom: 12 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  historyDate: { fontSize: 13, fontWeight: '600' },
  historyStatus: { fontSize: 12, fontWeight: '700' },
  historyRef: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  historyTime: { fontSize: 14 },
});

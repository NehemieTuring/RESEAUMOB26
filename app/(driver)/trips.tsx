import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { DashboardHeader, Card, Button } from '../../src/components';
import { useRouter } from 'expo-router';
import { tripApi } from '../../src/services/tripApi';

export default function DriverTripsScreen() {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [tripsHistory, setTripsHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
        const [active, history] = await Promise.all([
            tripApi.myActive().catch(() => null),
            tripApi.myHistory().catch(() => [])
        ]);
        setActiveTrip(active);
        setTripsHistory(history);
    } catch (err) {
        console.error('Error loading trips for driver:', err);
    } finally {
        setIsLoading(false);
        setRefreshing(false);
    }
  };

  React.useEffect(() => {
      loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCompleteTrip = async () => {
      if (!activeTrip) return;
      try {
          await tripApi.complete(activeTrip.id);
          loadData();
      } catch (err) {
          console.error(err);
      }
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
              <Text style={[styles.tripRef, { color: colors.textPrimary }]}>{activeTrip.tripCode || 'Trajet actuel'}</Text>
              <View style={[styles.badge, { backgroundColor: colors.primaryBlue + '20' }]}>
                <Text style={[styles.badgeText, { color: colors.primaryBlue }]}>En cours</Text>
              </View>
            </View>
            
            <View style={styles.tripRoute}>
              <View style={styles.routeNode}>
                <Ionicons name="radio-button-on" size={16} color={colors.primaryBlue} />
                <Text style={[styles.routeText, { color: colors.textPrimary }]}>{activeTrip.departureLocation || 'Lieu de départ'}</Text>
              </View>
              <View style={[styles.routeLine, { borderLeftColor: colors.borderGlass }]} />
              <View style={styles.routeNode}>
                <Ionicons name="location" size={16} color={colors.errorText} />
                <Text style={[styles.routeText, { color: colors.textPrimary }]}>{activeTrip.missionObject || 'Mission'}</Text>
              </View>
            </View>

            <Button title="Terminer le trajet" variant="primary" onPress={handleCompleteTrip} style={{ marginTop: 16 }} />
          </Card>
        ) : (
          <Text style={{ color: colors.textMuted, marginBottom: 24 }}>Aucun trajet en cours.</Text>
        )}

        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 16 }]}>Historique des trajets</Text>
        
        {tripsHistory.length > 0 ? tripsHistory.map((trip) => (
          <Card key={trip.id} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={[styles.historyDate, { color: colors.textMuted }]}>{trip.startDate}</Text>
              <Text style={[styles.historyStatus, { color: colors.successText }]}>{trip.status === 'COMPLETED' ? 'Terminé' : trip.status}</Text>
            </View>
            <Text style={[styles.historyRef, { color: colors.textPrimary }]}>{trip.tripCode}</Text>
            <Text style={[styles.historyTime, { color: colors.textSecondary }]}>{trip.startTime} - {trip.endTime || 'N/A'}</Text>
          </Card>
        )) : (
            <Text style={{ color: colors.textMuted }}>Aucun historique disponible.</Text>
        )}

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

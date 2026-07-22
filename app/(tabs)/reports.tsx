/**
 * FleetMan Mobile - Bilans (Reports) Screen
 * Dashboard style matching web version with real API data
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Switch,
    Alert,
    Platform,
    Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import {
    fuelRechargeApi,
    maintenanceApi,
    incidentApi,
    tripApi,
    vehicleApi,
    organizationApi,
    FuelRecharge,
    Maintenance,
    Trip,
} from '../../src/services';
import { Incident } from '../../src/services/incidentApi';
import { Vehicle } from '../../src/services/vehicleApi';
import { DashboardHeader } from '../../src/components/DashboardHeader';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { checkBackendHealth } from '../../src/services/healthCheck';

const { width } = Dimensions.get('window');

interface Stats {
    totalFuelCost: number;
    totalFuelQuantity: number;
    totalMaintenanceCost: number;
    maintenanceCount: number;
    totalDistance: number;
    tripCount: number;
    incidentCount: number;
    activeVehicles: number;
}

interface FleetOverview {
    active: number;
    inactive: number;
    inMaintenance: number;
    inService: number;
    total: number;
}

interface OrgInfo {
    name: string | null;
    logo: string | null;
}

export default function ReportsScreen() {
    const { t } = useTranslation();
    const { colors, isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Data states
    const [stats, setStats] = useState<Stats>({
        totalFuelCost: 0,
        totalFuelQuantity: 0,
        totalMaintenanceCost: 0,
        maintenanceCount: 0,
        totalDistance: 0,
        tripCount: 0,
        incidentCount: 0,
        activeVehicles: 0,
    });
    const [fleetOverview, setFleetOverview] = useState<FleetOverview>({
        active: 0,
        inactive: 0,
        inMaintenance: 0,
        inService: 0,
        total: 0,
    });
    const [recentFuelRecharges, setRecentFuelRecharges] = useState<FuelRecharge[]>([]);
    const [recentMaintenances, setRecentMaintenances] = useState<Maintenance[]>([]);
    const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);

    // Full data for export
    const [allFuelRecharges, setAllFuelRecharges] = useState<FuelRecharge[]>([]);
    const [allMaintenances, setAllMaintenances] = useState<Maintenance[]>([]);
    const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
    const [orgInfo, setOrgInfo] = useState<OrgInfo>({ name: null, logo: null });
    const [backendOnline, setBackendOnline] = useState<boolean>(true);
    const [backendError, setBackendError] = useState<string | null>(null);

    // Fetch all data
    const fetchData = async () => {
        try {
            setLoading(true);
            setBackendError(null);

            // Get user from AsyncStorage for admin filtering
            const userStr = await AsyncStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const adminId = user?.adminId || user?.userId;

            // Fetch all data in parallel
            const [fuelData, maintenanceData, tripData, incidentData, vehicleData] = await Promise.all([
                fuelRechargeApi.getAll(adminId),
                maintenanceApi.getAll(adminId),
                tripApi.getAll(adminId),
                incidentApi.getAll(adminId),
                vehicleApi.getAll(),
            ]);

            // If we reach here, backend is online
            setBackendOnline(true);
            setBackendError(null);

            // Calculate fuel stats
            const totalFuelCost = fuelData.reduce((sum: number, item: FuelRecharge) => sum + (item.rechargePrice || 0), 0);
            const totalFuelQuantity = fuelData.reduce((sum: number, item: FuelRecharge) => sum + (item.rechargeQuantity || 0), 0);

            // Calculate maintenance stats
            const totalMaintenanceCost = maintenanceData.reduce((sum: number, item: Maintenance) => sum + (item.maintenanceCost || 0), 0);

            // Calculate trip stats
            const totalDistance = tripData.reduce((sum: number, item: Trip) => sum + (item.actualDistance || item.plannedDistance || 0), 0);
            const completedTrips = tripData.filter((t: Trip) => t.status === 'COMPLETED').length;

            // Calculate fleet overview using 'state' and 'service' properties
            const activeVehicles = vehicleData.filter((v: Vehicle) => v.state === 'ACTIVE' || (v as any).state === 'IN_SERVICE').length;
            const inactiveVehicles = vehicleData.filter((v: Vehicle) => v.state === 'INACTIVE' || v.state === 'PARKED').length;
            const inMaintenance = vehicleData.filter((v: Vehicle) => v.state === 'UNDER_MAINTENANCE' || v.state === 'IN_MAINTENANCE').length;
            const inService = vehicleData.filter((v: Vehicle) => (v as any).service === 'IN_SERVICE' || v.state === 'ACTIVE').length;

            setStats({
                totalFuelCost,
                totalFuelQuantity,
                totalMaintenanceCost,
                maintenanceCount: maintenanceData.length,
                totalDistance,
                tripCount: completedTrips,
                incidentCount: incidentData.length,
                activeVehicles,
            });

            setFleetOverview({
                active: activeVehicles,
                inactive: inactiveVehicles,
                inMaintenance,
                inService,
                total: vehicleData.length,
            });

            setRecentFuelRecharges(fuelData.slice(0, 5));
            setRecentMaintenances(maintenanceData.slice(0, 5));
            setRecentIncidents(incidentData.slice(0, 5));

            setAllFuelRecharges(fuelData);
            setAllMaintenances(maintenanceData);
            setAllIncidents(incidentData);

            // Fetch organization info
            try {
                // Le profil societe est porte par le gestionnaire de flotte.
                const managerId = user?.userUuid;
                if (managerId) {
                    const mgr = await organizationApi.getById(managerId).catch(() => null);
                    if (mgr) {
                        setOrgInfo({
                            name: mgr.companyName,
                            logo: mgr.companyLogoUrl || mgr.photoUrl || null,
                        });
                    }
                }
            } catch (e) {
                console.log('Failed to fetch org info for report:', e);
            }

        } catch (error: any) {
            console.error('Error fetching report data:', error);
            setBackendOnline(false);
            setBackendError(error.message || 'Erreur de connexion au serveur');
            // Clear data when backend is offline
            setStats({
                totalFuelCost: 0,
                totalFuelQuantity: 0,
                totalMaintenanceCost: 0,
                maintenanceCount: 0,
                totalDistance: 0,
                tripCount: 0,
                incidentCount: 0,
                activeVehicles: 0,
            });
            setFleetOverview({
                active: 0,
                inactive: 0,
                inMaintenance: 0,
                inService: 0,
                total: 0,
            });
            setRecentFuelRecharges([]);
            setRecentMaintenances([]);
            setRecentIncidents([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const exportReportToPDF = async () => {
        try {
            setExporting(true);

            // Use all data instead of just the truncated "recent" lists
            const fuelList = allFuelRecharges.length > 0 ? allFuelRecharges : recentFuelRecharges;
            const maintenanceList = allMaintenances.length > 0 ? allMaintenances : recentMaintenances;
            const incidentList = allIncidents.length > 0 ? allIncidents : recentIncidents;

            const html = `
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
                    <style>
                        :root {
                            --primary: #2563eb;
                            --primary-dark: #1e40af;
                            --secondary: #64748b;
                            --success: #059669;
                            --warning: #d97706;
                            --danger: #dc2626;
                            --bg: #ffffff;
                            --card: #f8fafc;
                            --border: #e2e8f0;
                            --text-main: #0f172a;
                            --text-sub: #475569;
                            --white: #ffffff;
                        }
                        
                        * { box-sizing: border-box; }
                        
                        body { 
                            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                            background-color: var(--bg);
                            color: var(--text-main);
                            margin: 0;
                            padding: 30px;
                            line-height: 1.5;
                        }

                        @page {
                            margin: 20px;
                        }

                        .header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 30px;
                            padding-bottom: 20px;
                            border-bottom: 2px solid var(--border);
                        }

                        .org-branding {
                            display: flex;
                            align-items: center;
                            gap: 15px;
                        }

                        .org-logo {
                            width: 60px;
                            height: 60px;
                            object-fit: contain;
                            border-radius: 12px;
                            background: var(--card);
                            border: 1px solid var(--border);
                        }

                        .org-details h2 {
                            margin: 0;
                            font-size: 20px;
                            font-weight: 800;
                            color: var(--primary);
                            text-transform: uppercase;
                        }

                        .org-details p {
                            margin: 2px 0 0 0;
                            font-size: 11px;
                            color: var(--text-sub);
                            font-weight: 600;
                        }

                        .report-meta {
                            text-align: right;
                        }

                        .report-meta h1 {
                            margin: 0;
                            font-size: 24px;
                            font-weight: 800;
                            color: var(--text-main);
                        }

                        .report-meta p {
                            margin: 5px 0 0 0;
                            font-size: 12px;
                            color: var(--text-sub);
                        }

                        .summary-grid {
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 15px;
                            margin-bottom: 30px;
                        }

                        .summary-card {
                            background: var(--card);
                            padding: 15px;
                            border-radius: 12px;
                            border: 1px solid var(--border);
                        }

                        .summary-label {
                            font-size: 10px;
                            font-weight: 700;
                            color: var(--text-sub);
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            margin-bottom: 5px;
                        }

                        .summary-value {
                            font-size: 18px;
                            font-weight: 800;
                            color: var(--text-main);
                        }

                        .summary-sub {
                            font-size: 10px;
                            color: var(--text-sub);
                            margin-top: 4px;
                        }

                        .section-title {
                            font-size: 16px;
                            font-weight: 800;
                            color: var(--text-main);
                            margin: 30px 0 15px 0;
                            padding-left: 10px;
                            border-left: 4px solid var(--primary);
                        }

                        .fleet-grid {
                            display: grid;
                            grid-template-columns: repeat(5, 1fr);
                            gap: 10px;
                            margin-bottom: 30px;
                        }

                        .fleet-box {
                            text-align: center;
                            padding: 12px;
                            background: var(--card);
                            border-radius: 10px;
                            border-bottom: 3px solid var(--border);
                        }

                        .fleet-box.active { border-bottom-color: var(--success); }
                        .fleet-box.maintenance { border-bottom-color: var(--warning); }
                        .fleet-box.incident { border-bottom-color: var(--danger); }
                        .fleet-box.total { border-bottom-color: var(--primary); }

                        .fleet-num { font-size: 20px; font-weight: 800; margin-bottom: 2px; }
                        .fleet-txt { font-size: 9px; font-weight: 700; color: var(--text-sub); text-transform: uppercase; }

                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                            font-size: 11px;
                        }

                        th {
                            background-color: var(--card);
                            color: var(--text-sub);
                            font-weight: 700;
                            text-align: left;
                            padding: 12px 10px;
                            border-bottom: 2px solid var(--border);
                            text-transform: uppercase;
                            font-size: 10px;
                        }

                        td {
                            padding: 10px;
                            border-bottom: 1px solid var(--border);
                            color: var(--text-main);
                        }

                        tr:nth-child(even) {
                            background-color: rgba(248, 250, 252, 0.5);
                        }

                        .badge {
                            display: inline-block;
                            padding: 3px 8px;
                            border-radius: 4px;
                            font-size: 9px;
                            font-weight: 700;
                            text-transform: uppercase;
                        }

                        .badge-danger { background: #fee2e2; color: #991b1b; }
                        .badge-warning { background: #fef3c7; color: #92400e; }
                        .badge-success { background: #dcfce7; color: #166534; }
                        .badge-info { background: #e0f2fe; color: #075985; }

                        .footer {
                            margin-top: 50px;
                            padding-top: 20px;
                            border-top: 1px solid var(--border);
                            display: flex;
                            justify-content: space-between;
                            font-size: 10px;
                            color: var(--text-sub);
                        }

                        .no-break {
                            page-break-inside: avoid;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="org-branding">
                            ${orgInfo.logo ? `<img src="${orgInfo.logo}" class="org-logo" />` : `<div class="org-logo" style="display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--primary); border: 2px solid var(--primary); font-size: 20px;">FM</div>`}
                            <div class="org-details">
                                <h2>${orgInfo.name || 'FLEETMAN'}</h2>
                                <p>Gestion de Flotte Intelligente</p>
                            </div>
                        </div>
                        <div class="report-meta">
                            <h1>Rapport d'Activité</h1>
                            <p>Généré le ${new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
                        </div>
                    </div>

                    <div class="summary-grid">
                        <div class="summary-card">
                            <div class="summary-label">Carburant</div>
                            <div class="summary-value">${formatCurrency(stats.totalFuelCost)}</div>
                            <div class="summary-sub">${stats.totalFuelQuantity.toFixed(1)} L consommés</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-label">Maintenance</div>
                            <div class="summary-value">${formatCurrency(stats.totalMaintenanceCost)}</div>
                            <div class="summary-sub">${stats.maintenanceCount} interventions</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-label">Distance</div>
                            <div class="summary-value">${formatDistance(stats.totalDistance)}</div>
                            <div class="summary-sub">${stats.tripCount} trajets terminés</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-label">Sécurité</div>
                            <div class="summary-value">${stats.incidentCount}</div>
                            <div class="summary-sub">Incidents signalés</div>
                        </div>
                    </div>

                    <div class="section-title">Aperçu de la Flotte</div>
                    <div class="fleet-grid">
                        <div class="fleet-box total"><div class="fleet-num">${fleetOverview.total}</div><div class="fleet-txt">Total</div></div>
                        <div class="fleet-box active"><div class="fleet-num">${fleetOverview.inService}</div><div class="fleet-txt">En Service</div></div>
                        <div class="fleet-box maintenance"><div class="fleet-num">${fleetOverview.inMaintenance}</div><div class="fleet-txt">Maintenance</div></div>
                        <div class="fleet-box"><div class="fleet-num">${fleetOverview.inactive}</div><div class="fleet-txt">Inactif</div></div>
                        <div class="fleet-box incident"><div class="fleet-num" style="color: var(--danger)">${stats.incidentCount}</div><div class="fleet-txt">Incidents</div></div>
                    </div>

                    ${fuelList.length > 0 ? `
                        <div class="no-break">
                            <div class="section-title">Historique des Recharges</div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Véhicule</th>
                                        <th>Station</th>
                                        <th>Quantité</th>
                                        <th>Montant</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${fuelList.map(r => `
                                        <tr>
                                            <td>${new Date(r.rechargeDatetime).toLocaleDateString('fr-FR')}</td>
                                            <td style="font-weight: 700;">${r.vehicleRegistration || `Véhicule #${r.vehicleId}`}</td>
                                            <td>${r.stationName}</td>
                                            <td>${r.rechargeQuantity} L</td>
                                            <td style="color: var(--primary); font-weight: 700;">${formatCurrency(r.rechargePrice)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : ''}

                    ${maintenanceList.length > 0 ? `
                        <div class="no-break">
                            <div class="section-title">Maintenances Réalisées</div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Sujet</th>
                                        <th>Véhicule</th>
                                        <th>Date</th>
                                        <th>Coût</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${maintenanceList.map(m => `
                                        <tr>
                                            <td style="font-weight: 700;">${m.maintenanceSubject}</td>
                                            <td>${m.vehicleRegistration || `Véhicule #${m.vehicleId}`}</td>
                                            <td>${new Date(m.maintenanceDatetime).toLocaleDateString('fr-FR')}</td>
                                            <td style="color: var(--warning); font-weight: 700;">${formatCurrency(m.maintenanceCost)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : ''}

                    ${incidentList.length > 0 ? `
                        <div class="no-break">
                            <div class="section-title">Journal des Incidents</div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Incident</th>
                                        <th>Véhicule</th>
                                        <th>Sévérité</th>
                                        <th>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${incidentList.map(i => `
                                        <tr>
                                            <td style="font-weight: 700;">${i.incidentTitle}</td>
                                            <td>${i.vehicleName}</td>
                                            <td><span class="badge ${i.incidentSeverity === 'CRITICAL' || i.incidentSeverity === 'HIGH' ? 'badge-danger' : 'badge-warning'}">${i.incidentSeverity}</span></td>
                                            <td><span class="badge ${i.incidentStatus === 'RESOLVED' ? 'badge-success' : 'badge-info'}">${i.incidentStatus}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : ''}

                    <div class="footer">
                        <div>Document confidentiel généré via FleetMan Mobile</div>
                        <div>Page 1/1</div>
                    </div>
                </body>
                </html>
            `;

            if (Platform.OS === 'web') {
                await Print.printAsync({ html });
            } else {
                const { uri } = await Print.printToFileAsync({ html });
                await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
            }

            Alert.alert('Succès', 'Le rapport PDF a été généré avec succès.');
        } catch (error) {
            console.error('Error generating PDF:', error);
            Alert.alert('Erreur', 'Impossible de générer le rapport PDF.');
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' FCFA';
    };

    const formatDistance = (km: number) => {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }).format(km) + ' km';
    };

    // Stat Card Component
    const StatCard = ({
        icon,
        iconColor,
        value,
        label,
        subLabel
    }: {
        icon: keyof typeof Ionicons.glyphMap;
        iconColor: string;
        value: string;
        label: string;
        subLabel?: string;
    }) => (
        <View style={[styles.statCard, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
            <View style={[styles.statIconContainer, { backgroundColor: iconColor + '20' }]}>
                <Ionicons name={icon} size={22} color={iconColor} />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
            {subLabel && <Text style={[styles.statSubLabel, { color: colors.textMuted }]}>{subLabel}</Text>}
        </View>
    );

    // Section Card Component
    const SectionCard = ({
        title,
        icon,
        count,
        countLabel,
        children,
        emptyMessage,
        iconColor,
    }: {
        title: string;
        icon: keyof typeof Ionicons.glyphMap;
        count: number;
        countLabel: string;
        children?: React.ReactNode;
        emptyMessage: string;
        iconColor: string;
    }) => (
        <View style={[styles.sectionCard, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                    <Ionicons name={icon} size={20} color={iconColor} />
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
                </View>
                <Text style={[styles.sectionCount, { color: colors.textMuted }]}>{count} {countLabel}</Text>
            </View>
            {count > 0 ? children : (
                <View style={styles.emptySection}>
                    <Text style={[styles.emptySectionText, { color: colors.textMuted }]}>{emptyMessage}</Text>
                </View>
            )}
        </View>
    );

    // Fleet Status Card
    const FleetStatusCard = ({
        count,
        label,
        color
    }: {
        count: number;
        label: string;
        color: string;
    }) => (
        <View style={styles.fleetStatusItem}>
            <Text style={[styles.fleetStatusCount, { color }]}>{count}</Text>
            <Text style={[styles.fleetStatusLabel, { color: colors.textSecondary }]}>{label}</Text>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.primaryDark }]}>
                <ActivityIndicator size="large" color={colors.primaryBlue} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('common.loading')}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryDark }]} edges={['top']}>
            {isDarkMode && (
                <LinearGradient
                    colors={[colors.primaryDark, '#0f172a', colors.primaryDark]}
                    style={StyleSheet.absoluteFillObject}
                />
            )}

            {/* Dashboard Header */}
            <DashboardHeader showSearch={false} onRefresh={onRefresh} isRefreshing={refreshing} />

            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Bilans</Text>
                        <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
                            Rapports d'activité et statistiques
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.exportButton, {
                            backgroundColor: colors.primaryBlue,
                        }]}
                        onPress={exportReportToPDF}
                        disabled={exporting}
                    >
                        {exporting ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <>
                                <Ionicons name="download-outline" size={20} color="#ffffff" />
                                <Text style={styles.exportButtonText}>Exporter</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryBlue} />
                }
            >
                {/* Main Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="water"
                        iconColor={colors.primaryBlue}
                        value={formatCurrency(stats.totalFuelCost)}
                        label="Coût Total Carburant"
                        subLabel={`${stats.totalFuelQuantity.toFixed(1)} L consommés`}
                    />
                    <StatCard
                        icon="construct"
                        iconColor={colors.warningText}
                        value={formatCurrency(stats.totalMaintenanceCost)}
                        label="Coût Maintenances"
                        subLabel={`${stats.maintenanceCount} maintenances`}
                    />
                    <StatCard
                        icon="location"
                        iconColor={colors.successText}
                        value={formatDistance(stats.totalDistance)}
                        label="Distance Parcourue"
                        subLabel={`${stats.tripCount} trajets`}
                    />
                    <StatCard
                        icon="warning"
                        iconColor={colors.errorText}
                        value={stats.incidentCount.toString()}
                        label="Incidents"
                        subLabel={`${stats.activeVehicles} véhicules actifs`}
                    />
                </View>

                {/* Fuel Recharges Section */}
                <SectionCard
                    title="Recharges de Carburant"
                    icon="water"
                    iconColor={colors.primaryBlue}
                    count={recentFuelRecharges.length}
                    countLabel="recharges"
                    emptyMessage="Aucune recharge enregistrée"
                >
                    {recentFuelRecharges.map((recharge) => (
                        <View key={recharge.rechargeId} style={[styles.listItem, { borderBottomColor: colors.borderGlass }]}>
                            <View style={styles.listItemContent}>
                                <Text style={[styles.listItemTitle, { color: colors.textPrimary }]}>
                                    {recharge.vehicleRegistration || `Véhicule #${recharge.vehicleId}`}
                                </Text>
                                <Text style={[styles.listItemSubtitle, { color: colors.textMuted }]}>
                                    {recharge.stationName} • {recharge.rechargeQuantity}L
                                </Text>
                            </View>
                            <Text style={[styles.listItemValue, { color: colors.primaryBlue }]}>
                                {formatCurrency(recharge.rechargePrice)}
                            </Text>
                        </View>
                    ))}
                </SectionCard>

                {/* Maintenances Section */}
                <SectionCard
                    title="Maintenances"
                    icon="construct"
                    iconColor={colors.warningText}
                    count={recentMaintenances.length}
                    countLabel="maintenances"
                    emptyMessage="Aucune maintenance enregistrée"
                >
                    {recentMaintenances.map((maintenance) => (
                        <View key={maintenance.maintenanceId} style={[styles.listItem, { borderBottomColor: colors.borderGlass }]}>
                            <View style={styles.listItemContent}>
                                <Text style={[styles.listItemTitle, { color: colors.textPrimary }]}>
                                    {maintenance.maintenanceSubject}
                                </Text>
                                <Text style={[styles.listItemSubtitle, { color: colors.textMuted }]}>
                                    {maintenance.vehicleRegistration || `Véhicule #${maintenance.vehicleId}`}
                                </Text>
                            </View>
                            <Text style={[styles.listItemValue, { color: colors.warningText }]}>
                                {formatCurrency(maintenance.maintenanceCost)}
                            </Text>
                        </View>
                    ))}
                </SectionCard>

                {/* Incidents Section */}
                <SectionCard
                    title="Incidents Récents"
                    icon="warning"
                    iconColor={colors.errorText}
                    count={recentIncidents.length}
                    countLabel="incidents"
                    emptyMessage="Aucun incident enregistré"
                >
                    {recentIncidents.map((incident) => (
                        <View key={incident.incidentId} style={[styles.listItem, { borderBottomColor: colors.borderGlass }]}>
                            <View style={styles.listItemContent}>
                                <Text style={[styles.listItemTitle, { color: colors.textPrimary }]}>
                                    {incident.incidentTitle}
                                </Text>
                                <Text style={[styles.listItemSubtitle, { color: colors.textMuted }]}>
                                    {incident.vehicleName} • {incident.driverName}
                                </Text>
                            </View>
                            <View style={[styles.severityBadge, {
                                backgroundColor: incident.incidentSeverity === 'CRITICAL' ? colors.errorText + '20' :
                                    incident.incidentSeverity === 'HIGH' ? colors.warningText + '20' :
                                        incident.incidentSeverity === 'MEDIUM' ? colors.primaryBlue + '20' :
                                            colors.successText + '20'
                            }]}>
                                <Text style={[styles.severityText, {
                                    color: incident.incidentSeverity === 'CRITICAL' ? colors.errorText :
                                        incident.incidentSeverity === 'HIGH' ? colors.warningText :
                                            incident.incidentSeverity === 'MEDIUM' ? colors.primaryBlue :
                                                colors.successText
                                }]}>
                                    {incident.incidentSeverity}
                                </Text>
                            </View>
                        </View>
                    ))}
                </SectionCard>

                {/* Fleet Overview Section */}
                <View style={[styles.fleetOverviewCard, { backgroundColor: colors.surfaceCard, borderColor: colors.borderGlass }]}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="car-sport" size={20} color={colors.primaryCyan} />
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Aperçu de la Flotte</Text>
                        </View>
                        <Text style={[styles.sectionCount, { color: colors.textMuted }]}>{fleetOverview.total} véhicules</Text>
                    </View>
                    <View style={styles.fleetStatusGrid}>
                        <FleetStatusCard count={fleetOverview.active} label="Actifs" color={colors.successText} />
                        <FleetStatusCard count={fleetOverview.inactive} label="Inactifs" color={colors.errorText} />
                        <FleetStatusCard count={fleetOverview.inMaintenance} label="En maintenance" color={colors.warningText} />
                        <FleetStatusCard count={fleetOverview.inService} label="En service" color={colors.primaryBlue} />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14 },
    header: { padding: 16, paddingTop: 8 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 8,
    },
    exportButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
    pageTitle: { fontSize: 24, fontWeight: '700' },
    pageSubtitle: { fontSize: 14, marginTop: 4 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 16, paddingTop: 8, paddingBottom: 32 },

    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        width: (width - 44) / 2,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    statSubLabel: {
        fontSize: 11,
        marginTop: 4,
    },

    // Section Card
    sectionCard: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 12,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    sectionCount: {
        fontSize: 12,
    },
    emptySection: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    emptySectionText: {
        fontSize: 14,
    },

    // List Items
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    listItemContent: {
        flex: 1,
    },
    listItemTitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    listItemSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    listItemValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    severityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    severityText: {
        fontSize: 10,
        fontWeight: '600',
    },

    // Fleet Overview
    fleetOverviewCard: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    fleetStatusGrid: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    fleetStatusItem: {
        flex: 1,
        alignItems: 'center',
    },
    fleetStatusCount: {
        fontSize: 24,
        fontWeight: '700',
    },
    fleetStatusLabel: {
        fontSize: 11,
        marginTop: 4,
        textAlign: 'center',
    },
});

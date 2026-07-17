package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "kpi_snapshots", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KpiSnapshotEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "fleet_id")
    private UUID fleetId;

    @Column(name = "entity_type", length = 50)
    private String entityType;

    @Column(name = "entity_id")
    private UUID entityId;

    @Column(name = "period_type", length = 50)
    private String periodType;

    @Column(name = "period_start")
    private LocalDate periodStart;

    @Column(name = "period_end")
    private LocalDate periodEnd;

    @Column(name = "total_km")
    private BigDecimal totalKm;

    @Column(name = "total_trips")
    private Integer totalTrips;

    @Column(name = "total_driving_hours")
    private BigDecimal totalDrivingHours;

    @Column(name = "availability_rate")
    private BigDecimal availabilityRate;

    @Column(name = "total_fuel_cost")
    private BigDecimal totalFuelCost;

    @Column(name = "total_fuel_liters")
    private BigDecimal totalFuelLiters;

    @Column(name = "total_maintenance_cost")
    private BigDecimal totalMaintenanceCost;

    @Column(name = "total_incident_cost")
    private BigDecimal totalIncidentCost;

    @Column(name = "cost_per_km")
    private BigDecimal costPerKm;

    @Column(name = "fuel_per_100km")
    private BigDecimal fuelPer100km;

    @Column(name = "total_incidents")
    private Integer totalIncidents;

    @Column(name = "incident_rate")
    private BigDecimal incidentRate;

    @Column(name = "avg_driver_score")
    private BigDecimal avgDriverScore;

    @Column(name = "doc_compliance_rate")
    private BigDecimal docComplianceRate;
}

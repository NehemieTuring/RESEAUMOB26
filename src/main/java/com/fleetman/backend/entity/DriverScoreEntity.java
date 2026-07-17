package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "driver_scores", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverScoreEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "driver_id")
    private UUID driverId;

    @Column(name = "fleet_id")
    private UUID fleetId;

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "period_type", length = 50)
    private String periodType;

    @Column(name = "period_start")
    private LocalDate periodStart;

    @Column(name = "period_end")
    private LocalDate periodEnd;

    @Column(name = "total_trips")
    private Integer totalTrips;

    @Column(name = "total_km")
    private BigDecimal totalKm;

    @Column(name = "total_incidents")
    private Integer totalIncidents;

    @Column(name = "safety_score")
    private BigDecimal safetyScore;

    @Column(name = "efficiency_score")
    private BigDecimal efficiencyScore;

    @Column(name = "punctuality_score")
    private BigDecimal punctualityScore;

    @Column(name = "compliance_score")
    private BigDecimal complianceScore;

    @Column(name = "fuel_efficiency_score")
    private BigDecimal fuelEfficiencyScore;

    @Column(name = "final_score")
    private BigDecimal finalScore;

    @Column(name = "badge", length = 50)
    private String badge;
}

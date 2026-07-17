package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "maintenance_plans", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenancePlanEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "maintenance_type", length = 50)
    private String maintenanceType;

    @Column(name = "scope", length = 50)
    private String scope;

    @Column(name = "fleet_id")
    private UUID fleetId;

    @Column(name = "vehicle_id")
    private UUID vehicleId;

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "label")
    private String label;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "interval_km")
    private Integer intervalKm;

    @Column(name = "interval_days")
    private Integer intervalDays;

    @Column(name = "pre_alert_km")
    private Integer preAlertKm;

    @Column(name = "pre_alert_days")
    private Integer preAlertDays;

    @Column(name = "active")
    @Builder.Default
    private boolean active = true;
}

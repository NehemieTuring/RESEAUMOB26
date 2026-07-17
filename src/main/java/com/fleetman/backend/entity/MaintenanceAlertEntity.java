package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "maintenance_alerts", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceAlertEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "plan_id")
    private UUID planId;

    @Column(name = "maintenance_type", length = 50)
    private String maintenanceType;

    @Column(name = "vehicle_id")
    private UUID vehicleId;

    @Column(name = "vehicle_registration")
    private String vehicleRegistration;

    @Column(name = "fleet_id")
    private UUID fleetId;

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "trigger_type", length = 50)
    private String triggerType;

    @Column(name = "last_maintenance_km")
    private BigDecimal lastMaintenanceKm;

    @Column(name = "target_km")
    private BigDecimal targetKm;

    @Column(name = "current_km")
    private BigDecimal currentKm;

    @Column(name = "km_remaining")
    private BigDecimal kmRemaining;

    @Column(name = "last_maintenance_date")
    private LocalDate lastMaintenanceDate;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "days_remaining")
    private Integer daysRemaining;
}

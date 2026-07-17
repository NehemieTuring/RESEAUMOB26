package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "maintenance_parameters", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceParameterEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "vehicle_id", unique = true)
    private UUID vehicleId;

    @Column(name = "last_maintenance_at")
    private LocalDate lastMaintenanceAt;

    @Column(name = "next_maintenance_at")
    private LocalDate nextMaintenanceAt;

    @Column(name = "engine_status", length = 50)
    @Builder.Default
    private String engineStatus = "OK";

    @Column(name = "battery_health")
    private Integer batteryHealth;

    @Column(name = "maintenance_status", length = 50)
    @Builder.Default
    private String maintenanceStatus = "UP_TO_DATE";
}

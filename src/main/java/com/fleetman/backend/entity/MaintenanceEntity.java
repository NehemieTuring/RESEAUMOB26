package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "maintenances", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "subject")
    private String subject;

    @Column(name = "cost")
    private BigDecimal cost;

    @Column(name = "date_time")
    private Instant dateTime;

    @Column(name = "report", columnDefinition = "TEXT")
    private String report;

    @Column(name = "vehicle_id")
    private UUID vehicleId;

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "vehicle_registration", length = 50)
    private String vehicleRegistration;

    @Column(name = "driver_id")
    private UUID driverId;

    @Column(name = "driver_full_name")
    private String driverFullName;

    @Column(name = "location_name")
    private String locationName;

    @Column(name = "deleted")
    @Builder.Default
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();
}

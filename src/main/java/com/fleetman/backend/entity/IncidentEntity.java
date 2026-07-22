package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "incidents", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "type", length = 50)
    private String type;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "severity", length = 50)
    private String severity;

    @Column(name = "incident_date_time")
    private Instant incidentDateTime;

    @Column(name = "cost")
    private BigDecimal cost;

    @Column(name = "status", length = 50)
    private String status;

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

    @Column(name = "reported_by")
    private String reportedBy;

    @Column(name = "longitude")
    private BigDecimal longitude;

    @Column(name = "latitude")
    private BigDecimal latitude;

    @Column(name = "deleted")
    @Builder.Default
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();
}

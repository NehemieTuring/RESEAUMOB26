package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "geofence_zones", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeofenceZoneEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "fleet_id")
    private UUID fleetId;

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "name")
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "zone_type", length = 50)
    @Builder.Default
    private String zoneType = "POLYGON";

    @Column(name = "radius")
    private BigDecimal radius;

    @Column(name = "remote_id")
    private String remoteId;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "deleted")
    @Builder.Default
    private boolean deleted = false;
}

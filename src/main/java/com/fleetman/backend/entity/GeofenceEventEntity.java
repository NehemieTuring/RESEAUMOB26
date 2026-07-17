package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "geofence_events", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeofenceEventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "vehicle_id")
    private UUID vehicleId;

    @Column(name = "zone_id")
    private UUID zoneId;

    @Column(name = "type", length = 50)
    private String type;

    @Column(name = "speed")
    private BigDecimal speed;

    @Column(name = "severity", length = 50)
    private String severity;

    @Column(name = "is_read")
    @Builder.Default
    private boolean isRead = false;

    @Column(name = "timestamp")
    @Builder.Default
    private Instant timestamp = Instant.now();
}

package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "alert_events", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertEventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "rule_id")
    private UUID ruleId;

    @Column(name = "triggered_at")
    private Instant triggeredAt;

    @Column(name = "metric_value")
    private BigDecimal metricValue;

    @Column(name = "entity_type", length = 50)
    private String entityType;

    @Column(name = "entity_id")
    private UUID entityId;

    @Column(name = "severity", length = 50)
    private String severity;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "acknowledged")
    @Builder.Default
    private boolean acknowledged = false;

    @Column(name = "acknowledged_at")
    private Instant acknowledgedAt;

    @Column(name = "acknowledged_by")
    private UUID acknowledgedBy;
}

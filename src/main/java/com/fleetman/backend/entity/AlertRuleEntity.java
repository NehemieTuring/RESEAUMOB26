package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "alert_rules", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertRuleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "fleet_id")
    private UUID fleetId;

    @Column(name = "rule_type", length = 50)
    private String ruleType;

    @Column(name = "metric", length = 50)
    private String metric;

    @Column(name = "operator", length = 10)
    private String operator;

    @Column(name = "threshold")
    private BigDecimal threshold;

    @Column(name = "severity", length = 50)
    private String severity;

    @Column(name = "target_scope", length = 50)
    private String targetScope;

    @Column(name = "target_id")
    private UUID targetId;

    @Column(name = "notification_channels", columnDefinition = "TEXT")
    private String notificationChannels;

    @Column(name = "active")
    @Builder.Default
    private boolean active = true;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "cooldown_minutes")
    private Integer cooldownMinutes;
}

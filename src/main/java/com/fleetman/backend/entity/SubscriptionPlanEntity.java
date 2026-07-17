package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "subscription_plans", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlanEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "name")
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price")
    private BigDecimal price;

    @Column(name = "duration_months")
    private Integer durationMonths;

    @Column(name = "max_vehicles")
    private Integer maxVehicles;

    @Column(name = "max_drivers")
    private Integer maxDrivers;

    @Column(name = "features", columnDefinition = "TEXT")
    private String features;

    @Column(name = "is_active")
    @Builder.Default
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;
}

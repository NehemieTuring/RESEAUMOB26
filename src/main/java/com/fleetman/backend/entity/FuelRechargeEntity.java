package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "fuel_recharges", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuelRechargeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "quantity")
    private BigDecimal quantity;

    @Column(name = "price")
    private BigDecimal price;

    @Column(name = "recharge_date_time")
    private Instant rechargeDateTime;

    @Column(name = "station_name")
    private String stationName;

    @Column(name = "vehicle_id")
    private UUID vehicleId;

    @Column(name = "vehicle_registration", length = 50)
    private String vehicleRegistration;

    @Column(name = "driver_id")
    private UUID driverId;

    @Column(name = "driver_full_name")
    private String driverFullName;

    @Column(name = "deleted")
    @Builder.Default
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();
}

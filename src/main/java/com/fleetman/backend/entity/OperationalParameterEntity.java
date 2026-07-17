package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "operational_parameters", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperationalParameterEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "vehicle_id", unique = true)
    private UUID vehicleId;

    @Column(name = "status")
    @Builder.Default
    private boolean status = true;

    @Column(name = "current_speed")
    private BigDecimal currentSpeed;

    @Column(name = "fuel_level", length = 50)
    private String fuelLevel;

    @Column(name = "mileage")
    private BigDecimal mileage;

    @Column(name = "odometer_reading")
    private BigDecimal odometerReading;

    @Column(name = "bearing")
    private BigDecimal bearing;

    @Column(name = "latitude")
    private BigDecimal latitude;

    @Column(name = "longitude")
    private BigDecimal longitude;

    @Column(name = "timestamp")
    @Builder.Default
    private Instant timestamp = Instant.now();
}

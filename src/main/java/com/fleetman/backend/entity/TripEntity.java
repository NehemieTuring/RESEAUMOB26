package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "trips", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "trip_code", length = 50, unique = true)
    private String tripCode;

    @Column(name = "vehicle_id")
    private UUID vehicleId;

    @Column(name = "driver_id")
    private UUID driverId;

    @Column(name = "fleet_id")
    private UUID fleetId;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "status", length = 50)
    @Builder.Default
    private String status = "SCHEDULED";

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "departure_location")
    private String departureLocation;

    @Column(name = "departure_km_index")
    private BigDecimal departureKmIndex;

    @Column(name = "departure_fuel_index")
    private BigDecimal departureFuelIndex;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "return_location")
    private String returnLocation;

    @Column(name = "return_km_index")
    private BigDecimal returnKmIndex;

    @Column(name = "return_fuel_index")
    private BigDecimal returnFuelIndex;

    @Column(name = "return_registered_at")
    private Instant returnRegisteredAt;

    @Column(name = "scheduled_return_datetime")
    private LocalDateTime scheduledReturnDatetime;

    @Column(name = "mission_object", columnDefinition = "TEXT")
    private String missionObject;

    @Column(name = "mission_cost")
    private BigDecimal missionCost;

    @Column(name = "rate_type", length = 50)
    private String rateType;

    @Column(name = "distance_km")
    private BigDecimal distanceKm;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "computed_distance_km")
    private BigDecimal computedDistanceKm;

    @Column(name = "computed_fuel_consumed")
    private BigDecimal computedFuelConsumed;

    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    private String cancelReason;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;
}

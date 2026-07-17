package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "trip_details", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripDetailEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "trip_id", nullable = false)
    private UUID tripId;

    @Column(name = "item_type", length = 100, nullable = false)
    private String itemType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "weight")
    private BigDecimal weight;

    @Column(name = "departure_quantity")
    private Integer departureQuantity;

    @Column(name = "return_quantity")
    private Integer returnQuantity;
}

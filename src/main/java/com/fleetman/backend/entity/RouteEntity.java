package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "routes", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "trip_id")
    private UUID tripId;

    @Column(name = "start_point_id")
    private UUID startPointId;

    @Column(name = "end_point_id")
    private UUID endPointId;
}

package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "vehicle_illustration_images", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleIllustrationImageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "vehicle_id", nullable = false)
    private UUID vehicleId;

    @Column(name = "image_path", nullable = false)
    private String imagePath;
}

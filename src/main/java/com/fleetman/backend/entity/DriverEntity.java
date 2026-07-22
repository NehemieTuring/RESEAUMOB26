package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "drivers", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverEntity {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "fleet_id")
    private UUID fleetId;

    @Column(name = "licence_number", length = 100, unique = true, nullable = false)
    private String licenceNumber;

    @Column(name = "status", length = 50)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "assigned_vehicle_id")
    private UUID assignedVehicleId;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "deleted")
    @Builder.Default
    private boolean deleted = false;
}

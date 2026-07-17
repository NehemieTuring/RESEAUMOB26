package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "fleets", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FleetEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "manager_id", nullable = false)
    private UUID managerId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "phone_number", length = 50)
    private String phoneNumber;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "organization_id")
    private UUID organizationId;
}

package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "organizations", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "uin", unique = true)
    private String uin;

    @Column(name = "tax_id", unique = true)
    private String taxId;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();
}

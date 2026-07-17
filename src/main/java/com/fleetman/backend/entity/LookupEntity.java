package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

/**
 * Superclasse pour toutes les tables de référence (lookup).
 * Modèle commun : id UUID, code, label, description.
 */
@MappedSuperclass
@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class LookupEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "code", length = 50, unique = true, nullable = false)
    private String code;

    @Column(name = "label", length = 100, nullable = false)
    private String label;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}

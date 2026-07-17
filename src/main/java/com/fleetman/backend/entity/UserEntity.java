package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "username")
    private String username;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "photo_url", length = 512)
    private String photoUrl;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "is_active")
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(name = "kernel_id")
    private UUID kernelId;

    @Column(name = "organization_id")
    private UUID organizationId;
}

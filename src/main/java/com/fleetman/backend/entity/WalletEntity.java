package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "wallets", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "owner_id", unique = true, nullable = false)
    private UUID ownerId;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "balance")
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;
}

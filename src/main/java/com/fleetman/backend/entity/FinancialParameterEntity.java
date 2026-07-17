package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "financial_parameters", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialParameterEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "vehicle_id", unique = true)
    private UUID vehicleId;

    @Column(name = "insurance_number", length = 100)
    private String insuranceNumber;

    @Column(name = "insurance_expired_at")
    private LocalDate insuranceExpiredAt;

    @Column(name = "registered_at")
    private LocalDate registeredAt;

    @Column(name = "purchased_at")
    private LocalDate purchasedAt;

    @Column(name = "depreciation_rate")
    private Integer depreciationRate;

    @Column(name = "cost_per_km")
    private BigDecimal costPerKm;
}

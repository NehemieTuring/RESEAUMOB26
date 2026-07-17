package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "budgets", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "scope", length = 50)
    private String scope;

    @Column(name = "entity_id")
    private UUID entityId;

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "budget_month")
    private LocalDate budgetMonth;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "consumed")
    @Builder.Default
    private BigDecimal consumed = BigDecimal.ZERO;

    @Column(name = "alert_level", length = 50)
    private String alertLevel;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}

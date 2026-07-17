package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "expenses", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "expense_type", length = 50)
    private String expenseType;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "source_type", length = 50)
    private String sourceType;

    @Column(name = "vehicle_id")
    private UUID vehicleId;

    @Column(name = "vehicle_registration")
    private String vehicleRegistration;

    @Column(name = "fleet_id")
    private UUID fleetId;

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "driver_id")
    private UUID driverId;

    @Column(name = "driver_full_name")
    private String driverFullName;

    @Column(name = "reject_reason", columnDefinition = "TEXT")
    private String rejectReason;

    @CreationTimestamp
    @Column(name = "expense_date")
    private Instant expenseDate;

    @Column(name = "deleted")
    @Builder.Default
    private boolean deleted = false;
}

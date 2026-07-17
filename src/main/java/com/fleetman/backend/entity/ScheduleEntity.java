package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "schedules", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "fleet_id")
    private UUID fleetId;

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "title")
    private String title;

    @Column(name = "period_type", length = 50)
    private String periodType;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}

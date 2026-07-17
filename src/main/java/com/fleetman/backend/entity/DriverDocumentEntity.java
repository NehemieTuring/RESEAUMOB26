package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "driver_documents", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverDocumentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "driver_id")
    private UUID driverId;

    @Column(name = "doc_type", length = 50)
    private String docType;

    @Column(name = "doc_number", length = 100)
    private String docNumber;

    @Column(name = "license_categories", length = 50)
    private String licenseCategories;

    @Column(name = "issuer")
    private String issuer;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "file_url", length = 512)
    private String fileUrl;

    @Column(name = "deleted")
    @Builder.Default
    private boolean deleted = false;
}

package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "document_alerts", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentAlertEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "document_id")
    private UUID documentId;

    @Column(name = "document_type", length = 50)
    private String documentType;

    @Column(name = "alert_type", length = 50)
    private String alertType;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "recipient_id")
    private UUID recipientId;
}

package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "stored_files", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoredFileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "owner_id")
    private UUID ownerId;

    @Column(name = "owner_type", length = 50)
    private String ownerType;

    @Column(name = "file_type", length = 50)
    private String fileType;

    @Column(name = "original_name")
    private String originalName;

    @Column(name = "stored_path", length = 512)
    private String storedPath;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @CreationTimestamp
    @Column(name = "uploaded_at")
    private Instant uploadedAt;
}

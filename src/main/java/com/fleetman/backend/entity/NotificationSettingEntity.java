package com.fleetman.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "notification_settings", schema = "fleet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSettingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "type", length = 50)
    private String type;

    @Column(name = "enabled")
    @Builder.Default
    private boolean enabled = true;
}

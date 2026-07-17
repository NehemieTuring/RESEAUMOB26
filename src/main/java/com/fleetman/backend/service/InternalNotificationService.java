package com.fleetman.backend.service;

import com.fleetman.backend.entity.NotificationEntity;
import com.fleetman.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/** Notifications internes (stockees en BDD, pas de push reel). */
@Service
public class InternalNotificationService {

    private final NotificationRepository notificationRepository;

    public InternalNotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public boolean sendNotification(UUID userId, String title, String message, String type) {
        if (userId == null) return false;
        notificationRepository.save(NotificationEntity.builder()
                .userId(userId).title(title).message(message).type(type)
                .isRead(false).build());
        return true;
    }

    public List<NotificationEntity> getNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAsRead(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}

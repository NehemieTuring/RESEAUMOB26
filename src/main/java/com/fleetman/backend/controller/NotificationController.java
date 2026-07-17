package com.fleetman.backend.controller;

import com.fleetman.backend.entity.NotificationEntity;
import com.fleetman.backend.service.InternalNotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "25. Notifications")
@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final InternalNotificationService service;

    public NotificationController(InternalNotificationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<NotificationEntity>> list(Authentication auth) {
        return ResponseEntity.ok(service.getNotifications(SecurityUtils.getUserId(auth)));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable UUID id) {
        service.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}

package com.fleetman.backend.controller;

import com.fleetman.backend.service.AdminStatsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "06. Admin: Statistiques")
@RestController
@RequestMapping("/api/v1/admin/stats")
@PreAuthorize("hasAnyRole('FLEET_ADMIN','FLEET_SUPER_ADMIN')")
public class AdminStatsController {

    private final AdminStatsService service;

    public AdminStatsController(AdminStatsService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> stats() {
        return ResponseEntity.ok(service.globalStats());
    }
}

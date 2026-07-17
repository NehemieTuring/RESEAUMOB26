package com.fleetman.backend.controller;

import com.fleetman.backend.entity.MaintenanceAlertEntity;
import com.fleetman.backend.service.PreventiveMaintenanceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "21. Maintenance Preventive")
@RestController
@RequestMapping("/api/v1/maintenance-alerts")
public class MaintenanceAlertController {

    private final PreventiveMaintenanceService service;

    public MaintenanceAlertController(PreventiveMaintenanceService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceAlertEntity>> list(@RequestParam(required = false) UUID fleetId) {
        return ResponseEntity.ok(service.alertsByFleet(fleetId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceAlertEntity> get(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getAlert(id));
    }
}

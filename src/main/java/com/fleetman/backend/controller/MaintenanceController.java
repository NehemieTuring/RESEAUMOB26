package com.fleetman.backend.controller;

import com.fleetman.backend.entity.MaintenanceEntity;
import com.fleetman.backend.service.MaintenanceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "12. Operations: Maintenance")
@RestController
@RequestMapping("/api/v1/maintenances")
public class MaintenanceController {

    private final MaintenanceService service;

    public MaintenanceController(MaintenanceService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<MaintenanceEntity> create(@RequestBody MaintenanceEntity req, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req, SecurityUtils.getUserId(auth)));
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceEntity>> list(@RequestParam(required = false) UUID vehicleId, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(service.list(vehicleId, SecurityUtils.getUserId(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceEntity> get(@PathVariable UUID id, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(service.get(id, SecurityUtils.getUserId(auth)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceEntity> update(@PathVariable UUID id, @RequestBody MaintenanceEntity req, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(service.update(id, req, SecurityUtils.getUserId(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, org.springframework.security.core.Authentication auth) {
        service.delete(id, SecurityUtils.getUserId(auth));
        return ResponseEntity.noContent().build();
    }
}

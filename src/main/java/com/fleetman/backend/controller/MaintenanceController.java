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
    public ResponseEntity<MaintenanceEntity> create(@RequestBody MaintenanceEntity req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceEntity>> list(@RequestParam(required = false) UUID vehicleId) {
        return ResponseEntity.ok(service.list(vehicleId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceEntity> get(@PathVariable UUID id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceEntity> update(@PathVariable UUID id, @RequestBody MaintenanceEntity req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

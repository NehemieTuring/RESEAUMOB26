package com.fleetman.backend.controller;

import com.fleetman.backend.entity.MaintenancePlanEntity;
import com.fleetman.backend.service.PreventiveMaintenanceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "21. Maintenance Preventive")
@RestController
@RequestMapping("/api/v1/maintenance-plans")
public class MaintenancePlanController {

    private final PreventiveMaintenanceService service;

    public MaintenancePlanController(PreventiveMaintenanceService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<MaintenancePlanEntity> create(@RequestBody MaintenancePlanEntity req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createPlan(req));
    }

    @GetMapping
    public ResponseEntity<List<MaintenancePlanEntity>> list(@RequestParam(required = false) UUID fleetId) {
        return ResponseEntity.ok(service.plansByFleet(fleetId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenancePlanEntity> get(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getPlan(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenancePlanEntity> update(@PathVariable UUID id, @RequestBody MaintenancePlanEntity req) {
        return ResponseEntity.ok(service.updatePlan(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deletePlan(id);
        return ResponseEntity.noContent().build();
    }
}

package com.fleetman.backend.controller;

import com.fleetman.backend.entity.KpiSnapshotEntity;
import com.fleetman.backend.service.KpiService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "16. KPI & Rapports")
@RestController
@RequestMapping("/api/v1/kpis")
public class KpiController {

    private final KpiService service;

    public KpiController(KpiService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<KpiSnapshotEntity>> byFleet(@RequestParam UUID fleetId) {
        return ResponseEntity.ok(service.listByFleet(fleetId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<KpiSnapshotEntity> get(@PathVariable UUID id) {
        return ResponseEntity.ok(service.get(id));
    }

    @GetMapping("/vehicles/{vehicleId}/compute")
    public ResponseEntity<KpiSnapshotEntity> compute(@PathVariable UUID vehicleId,
                                                     @RequestParam(required = false) UUID fleetId) {
        return ResponseEntity.ok(service.computeForVehicle(vehicleId, fleetId));
    }
}

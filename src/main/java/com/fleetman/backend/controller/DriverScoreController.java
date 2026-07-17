package com.fleetman.backend.controller;

import com.fleetman.backend.entity.DriverScoreEntity;
import com.fleetman.backend.service.DriverScoringService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "20. Scoring Conducteurs")
@RestController
@RequestMapping("/api/v1/driver-scores")
public class DriverScoreController {

    private final DriverScoringService service;

    public DriverScoreController(DriverScoringService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<DriverScoreEntity> create(@RequestBody DriverScoreEntity req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @GetMapping
    public ResponseEntity<List<DriverScoreEntity>> list(@RequestParam(required = false) UUID driverId,
                                                        @RequestParam(required = false) UUID fleetId) {
        if (driverId != null) return ResponseEntity.ok(service.listByDriver(driverId));
        if (fleetId != null) return ResponseEntity.ok(service.listByFleet(fleetId));
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriverScoreEntity> get(@PathVariable UUID id) {
        return ResponseEntity.ok(service.get(id));
    }
}

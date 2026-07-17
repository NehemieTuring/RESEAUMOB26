package com.fleetman.backend.controller;

import com.fleetman.backend.entity.FuelRechargeEntity;
import com.fleetman.backend.service.FuelRechargeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "14. Operations: Carburant")
@RestController
@RequestMapping("/api/v1/fuel-recharges")
public class FuelRechargeController {

    private final FuelRechargeService service;

    public FuelRechargeController(FuelRechargeService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<FuelRechargeEntity> create(@RequestBody FuelRechargeEntity req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @GetMapping
    public ResponseEntity<List<FuelRechargeEntity>> list(@RequestParam(required = false) UUID vehicleId) {
        return ResponseEntity.ok(service.list(vehicleId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FuelRechargeEntity> get(@PathVariable UUID id) {
        return ResponseEntity.ok(service.get(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

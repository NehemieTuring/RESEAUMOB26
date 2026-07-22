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
    public ResponseEntity<FuelRechargeEntity> create(@RequestBody FuelRechargeEntity req, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req, SecurityUtils.getUserId(auth)));
    }

    @GetMapping
    public ResponseEntity<List<FuelRechargeEntity>> list(@RequestParam(required = false) UUID vehicleId, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(service.list(vehicleId, SecurityUtils.getUserId(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FuelRechargeEntity> get(@PathVariable UUID id, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(service.get(id, SecurityUtils.getUserId(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, org.springframework.security.core.Authentication auth) {
        service.delete(id, SecurityUtils.getUserId(auth));
        return ResponseEntity.noContent().build();
    }
}

package com.fleetman.backend.controller;

import com.fleetman.backend.controller.dto.*;
import com.fleetman.backend.entity.VehicleEntity;
import com.fleetman.backend.service.DriverService;
import com.fleetman.backend.service.FleetService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "10a. Flottes: Administration")
@RestController
@RequestMapping("/api/v1/fleets")
@PreAuthorize("hasAnyRole('FLEET_MANAGER','FLEET_ADMIN','FLEET_SUPER_ADMIN')")
public class FleetController {

    private final FleetService fleetService;
    private final DriverService driverService;

    public FleetController(FleetService fleetService, DriverService driverService) {
        this.fleetService = fleetService;
        this.driverService = driverService;
    }

    @PostMapping
    public ResponseEntity<FleetResponse> create(Authentication auth, @RequestBody FleetRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fleetService.create(req, SecurityUtils.getUserId(auth)));
    }

    @GetMapping
    public ResponseEntity<List<FleetResponse>> list(Authentication auth) {
        return ResponseEntity.ok(fleetService.listByManager(SecurityUtils.getUserId(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FleetResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(fleetService.get(id));
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<FleetStatsResponse> stats(@PathVariable UUID id) {
        return ResponseEntity.ok(fleetService.stats(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FleetResponse> update(@PathVariable UUID id, @RequestBody FleetRequest req) {
        return ResponseEntity.ok(fleetService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        fleetService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ----- Vehicules de la flotte -----

    @GetMapping("/{id}/vehicles")
    public ResponseEntity<List<VehicleEntity>> vehicles(@PathVariable UUID id) {
        return ResponseEntity.ok(fleetService.getVehicles(id));
    }

    @PostMapping("/{id}/vehicles")
    public ResponseEntity<Void> addVehicle(@PathVariable UUID id, @RequestBody VehicleIdRequest req) {
        fleetService.addVehicle(id, req.vehicleId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/vehicles/{vehicleId}")
    public ResponseEntity<Void> removeVehicle(@PathVariable UUID id, @PathVariable UUID vehicleId) {
        fleetService.removeVehicle(id, vehicleId);
        return ResponseEntity.noContent().build();
    }

    // ----- Chauffeurs de la flotte -----

    @GetMapping("/{id}/drivers")
    public ResponseEntity<List<DriverResponse>> drivers(@PathVariable UUID id) {
        return ResponseEntity.ok(driverService.list(id, null));
    }

    @PostMapping("/{id}/drivers")
    public ResponseEntity<Void> addDriver(@PathVariable UUID id, @RequestBody IdentifierRequest req) {
        driverService.addExistingDriverToFleet(id, req.identifier());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/drivers/{driverId}")
    public ResponseEntity<Void> removeDriver(@PathVariable UUID id, @PathVariable UUID driverId) {
        driverService.removeDriverFromFleet(id, driverId);
        return ResponseEntity.noContent().build();
    }
}

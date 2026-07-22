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
        return ResponseEntity.ok(fleetService.listFleets(SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FleetResponse> get(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(fleetService.get(id, SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<FleetStatsResponse> stats(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(fleetService.stats(id, SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FleetResponse> update(@PathVariable UUID id, @RequestBody FleetRequest req, Authentication auth) {
        return ResponseEntity.ok(fleetService.update(id, req, SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication auth) {
        fleetService.delete(id, SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth));
        return ResponseEntity.noContent().build();
    }

    // ----- Vehicules de la flotte -----

    @GetMapping("/{id}/vehicles")
    public ResponseEntity<List<VehicleEntity>> vehicles(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(fleetService.getVehicles(id, SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @PostMapping("/{id}/vehicles")
    public ResponseEntity<Void> addVehicle(@PathVariable UUID id, @RequestBody VehicleIdRequest req, Authentication auth) {
        fleetService.addVehicle(id, req.vehicleId(), SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/vehicles/{vehicleId}")
    public ResponseEntity<Void> removeVehicle(@PathVariable UUID id, @PathVariable UUID vehicleId, Authentication auth) {
        fleetService.removeVehicle(id, vehicleId, SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth));
        return ResponseEntity.noContent().build();
    }

    // ----- Chauffeurs de la flotte -----

    @GetMapping("/{id}/drivers")
    public ResponseEntity<List<DriverResponse>> drivers(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(driverService.list(id, null, SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @PostMapping("/{id}/drivers")
    public ResponseEntity<Void> addDriver(@PathVariable UUID id, @RequestBody IdentifierRequest req, Authentication auth) {
        driverService.addExistingDriverToFleet(id, req.identifier(), SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/drivers/{driverId}")
    public ResponseEntity<Void> removeDriver(@PathVariable UUID id, @PathVariable UUID driverId, Authentication auth) {
        driverService.removeDriverFromFleet(id, driverId, SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth));
        return ResponseEntity.noContent().build();
    }
}

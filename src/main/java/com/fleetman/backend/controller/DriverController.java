package com.fleetman.backend.controller;

import com.fleetman.backend.controller.dto.*;
import com.fleetman.backend.service.DriverService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Tag(name = "07. Chauffeurs")
@RestController
@RequestMapping("/api/v1")
@PreAuthorize("hasAnyRole('FLEET_MANAGER','FLEET_ADMIN','FLEET_SUPER_ADMIN')")
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @PostMapping(value = "/fleets/{fleetId}/drivers/register", consumes = {"multipart/form-data"})
    public ResponseEntity<DriverResponse> register(
            @PathVariable UUID fleetId,
            @RequestPart("user") DriverRegistrationRequest user,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(driverService.registerDriverWithPhoto(fleetId, user, file));
    }

    @GetMapping("/drivers")
    public ResponseEntity<List<DriverResponse>> list(
            @RequestParam(required = false) UUID fleetId,
            @RequestParam(required = false) Boolean isAssigned) {
        return ResponseEntity.ok(driverService.list(fleetId, isAssigned));
    }

    @GetMapping("/drivers/search")
    public ResponseEntity<DriverResponse> search(@RequestParam String identifier) {
        return ResponseEntity.ok(driverService.search(identifier));
    }

    @GetMapping("/drivers/{userId}")
    public ResponseEntity<DriverResponse> get(@PathVariable UUID userId) {
        return ResponseEntity.ok(driverService.get(userId));
    }

    @PutMapping("/drivers/{userId}")
    public ResponseEntity<DriverResponse> update(@PathVariable UUID userId,
                                                @RequestBody UpdateDriverRequest req) {
        return ResponseEntity.ok(driverService.update(userId, req));
    }

    @PostMapping("/drivers/{userId}/assign-vehicle")
    public ResponseEntity<Void> assign(@PathVariable UUID userId, @RequestBody VehicleIdRequest req) {
        driverService.assignVehicle(userId, req.vehicleId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/drivers/{userId}/unassign-vehicle")
    public ResponseEntity<Void> unassign(@PathVariable UUID userId,
                                        @RequestParam(required = false) UUID vehicleId) {
        driverService.unassignVehicle(userId, vehicleId);
        return ResponseEntity.ok().build();
    }
}

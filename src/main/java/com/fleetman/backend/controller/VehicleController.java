package com.fleetman.backend.controller;

import com.fleetman.backend.controller.dto.LookupResponse;
import com.fleetman.backend.controller.dto.VehicleDetailResponse;
import com.fleetman.backend.controller.dto.VehicleRequest;
import com.fleetman.backend.entity.FinancialParameterEntity;
import com.fleetman.backend.entity.MaintenanceParameterEntity;
import com.fleetman.backend.entity.OperationalParameterEntity;
import com.fleetman.backend.entity.VehicleEntity;
import com.fleetman.backend.service.VehicleResourceService;
import com.fleetman.backend.service.VehicleService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "09a. Vehicules: Parc")
@RestController
@RequestMapping("/api/v1/vehicles")
@PreAuthorize("hasAnyRole('FLEET_MANAGER','FLEET_ADMIN','FLEET_SUPER_ADMIN')")
public class VehicleController {

    private final VehicleService vehicleService;
    private final VehicleResourceService vehicleResourceService;

    public VehicleController(VehicleService vehicleService,
                            VehicleResourceService vehicleResourceService) {
        this.vehicleService = vehicleService;
        this.vehicleResourceService = vehicleResourceService;
    }

    @PostMapping
    public ResponseEntity<VehicleEntity> create(Authentication auth, @RequestBody VehicleRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vehicleService.createIndependentVehicle(req, SecurityUtils.getUserId(auth)));
    }

    @GetMapping
    public ResponseEntity<List<VehicleEntity>> list(Authentication auth) {
        return ResponseEntity.ok(vehicleService.getVehicles(
                SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth)));
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<VehicleDetailResponse> get(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(vehicleService.getVehicleDetails(vehicleId));
    }

    @PatchMapping("/{vehicleId}")
    public ResponseEntity<VehicleEntity> patch(@PathVariable UUID vehicleId,
                                               @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(vehicleService.patchVehicle(vehicleId, updates));
    }

    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<Void> delete(@PathVariable UUID vehicleId) {
        vehicleService.deleteVehicle(vehicleId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{vehicleId}/financial-parameters")
    public ResponseEntity<VehicleDetailResponse> updateFinancial(
            @PathVariable UUID vehicleId, @RequestBody FinancialParameterEntity req) {
        return ResponseEntity.ok(vehicleService.updateFinancialParameters(vehicleId, req));
    }

    @PutMapping("/{vehicleId}/maintenance-parameters")
    public ResponseEntity<VehicleDetailResponse> updateMaintenance(
            @PathVariable UUID vehicleId, @RequestBody MaintenanceParameterEntity req) {
        return ResponseEntity.ok(vehicleService.updateMaintenanceParameters(vehicleId, req));
    }

    @GetMapping("/{vehicleId}/operational")
    public ResponseEntity<OperationalParameterEntity> operational(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(vehicleService.getOperational(vehicleId));
    }

    @PatchMapping("/{vehicleId}/operational")
    public ResponseEntity<Void> patchOperational(@PathVariable UUID vehicleId,
                                                @RequestBody Map<String, Object> updates) {
        vehicleService.patchOperational(vehicleId, updates);
        return ResponseEntity.ok().build();
    }

    // ----- Referentiels -----

    @GetMapping("/lookup/{resource}")
    public ResponseEntity<List<LookupResponse>> lookup(@PathVariable String resource) {
        return ResponseEntity.ok(vehicleResourceService.lookup(resource));
    }

    @GetMapping("/resources/all")
    public ResponseEntity<Map<String, List<LookupResponse>>> allResources() {
        return ResponseEntity.ok(vehicleResourceService.all());
    }
}

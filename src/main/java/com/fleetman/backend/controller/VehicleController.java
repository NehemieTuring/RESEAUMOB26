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
                SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @GetMapping("/{vehicleId}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER','FLEET_ADMIN','FLEET_SUPER_ADMIN','FLEET_DRIVER')")
    public ResponseEntity<VehicleDetailResponse> get(@PathVariable UUID vehicleId, Authentication auth) {
        if (SecurityUtils.isDriver(auth)) {
            String assignedId = SecurityUtils.currentUser(auth).vehicleId();
            if (assignedId == null || !assignedId.equals(vehicleId.toString())) {
                throw new org.springframework.security.access.AccessDeniedException("Vous n'êtes pas assigné à ce véhicule.");
            }
            return ResponseEntity.ok(vehicleService.getVehicleDetails(vehicleId, null, false, null));
        }
        return ResponseEntity.ok(vehicleService.getVehicleDetails(vehicleId, SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @PatchMapping("/{vehicleId}")
    public ResponseEntity<VehicleEntity> patch(@PathVariable UUID vehicleId,
                                               @RequestBody Map<String, Object> updates, Authentication auth) {
        return ResponseEntity.ok(vehicleService.patchVehicle(vehicleId, updates, SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<Void> delete(@PathVariable UUID vehicleId, Authentication auth) {
        vehicleService.deleteVehicle(vehicleId, SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{vehicleId}/financial-parameters")
    public ResponseEntity<VehicleDetailResponse> updateFinancial(
            @PathVariable UUID vehicleId, @RequestBody FinancialParameterEntity req, Authentication auth) {
        return ResponseEntity.ok(vehicleService.updateFinancialParameters(vehicleId, req, SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @PutMapping("/{vehicleId}/maintenance-parameters")
    public ResponseEntity<VehicleDetailResponse> updateMaintenance(
            @PathVariable UUID vehicleId, @RequestBody MaintenanceParameterEntity req, Authentication auth) {
        return ResponseEntity.ok(vehicleService.updateMaintenanceParameters(vehicleId, req, SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @GetMapping("/{vehicleId}/operational")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER','FLEET_ADMIN','FLEET_SUPER_ADMIN','FLEET_DRIVER')")
    public ResponseEntity<OperationalParameterEntity> operational(@PathVariable UUID vehicleId, Authentication auth) {
        if (SecurityUtils.isDriver(auth)) {
            String assignedId = SecurityUtils.currentUser(auth).vehicleId();
            if (assignedId == null || !assignedId.equals(vehicleId.toString())) {
                throw new org.springframework.security.access.AccessDeniedException("Vous n'êtes pas assigné à ce véhicule.");
            }
            return ResponseEntity.ok(vehicleService.getOperational(vehicleId, null, false, null));
        }
        return ResponseEntity.ok(vehicleService.getOperational(vehicleId, SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @PatchMapping("/{vehicleId}/operational")
    public ResponseEntity<Void> patchOperational(@PathVariable UUID vehicleId,
                                                @RequestBody Map<String, Object> updates, Authentication auth) {
        vehicleService.patchOperational(vehicleId, updates, SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth));
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

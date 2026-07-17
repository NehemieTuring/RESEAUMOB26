package com.fleetman.backend.controller;

import com.fleetman.backend.entity.VehicleTypeEntity;
import com.fleetman.backend.service.VehicleTypeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "05. Admin: Ressources")
@RestController
@RequestMapping("/api/v1/admin/resources")
@PreAuthorize("hasAnyRole('FLEET_ADMIN','FLEET_SUPER_ADMIN')")
public class AdminResourceController {

    private final VehicleTypeService vehicleTypeService;

    public AdminResourceController(VehicleTypeService vehicleTypeService) {
        this.vehicleTypeService = vehicleTypeService;
    }

    @GetMapping("/vehicle-types")
    public ResponseEntity<List<VehicleTypeEntity>> listTypes() {
        return ResponseEntity.ok(vehicleTypeService.list());
    }

    @PostMapping("/vehicle-types")
    public ResponseEntity<VehicleTypeEntity> createType(@RequestBody VehicleTypeEntity req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleTypeService.create(req));
    }

    @DeleteMapping("/vehicle-types/{id}")
    public ResponseEntity<Void> deleteType(@PathVariable UUID id) {
        vehicleTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

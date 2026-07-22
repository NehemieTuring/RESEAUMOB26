package com.fleetman.backend.controller;

import com.fleetman.backend.entity.DriverDocumentEntity;
import com.fleetman.backend.entity.VehicleDocumentEntity;
import com.fleetman.backend.service.DocumentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "15. Documents Legaux")
@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {

    private final DocumentService service;

    public DocumentController(DocumentService service) {
        this.service = service;
    }

    @PostMapping("/vehicles")
    public ResponseEntity<VehicleDocumentEntity> createVehicleDoc(@RequestBody VehicleDocumentEntity req, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createVehicleDocument(req, com.fleetman.backend.controller.SecurityUtils.getUserId(auth), com.fleetman.backend.controller.SecurityUtils.isAdmin(auth), com.fleetman.backend.controller.SecurityUtils.getOrganizationId(auth)));
    }

    @GetMapping("/vehicles")
    public ResponseEntity<List<VehicleDocumentEntity>> vehicleDocs(@RequestParam(required = false) UUID vehicleId, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(service.vehicleDocuments(vehicleId, com.fleetman.backend.controller.SecurityUtils.getUserId(auth), com.fleetman.backend.controller.SecurityUtils.isAdmin(auth), com.fleetman.backend.controller.SecurityUtils.getOrganizationId(auth)));
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<Void> deleteVehicleDoc(@PathVariable UUID id, org.springframework.security.core.Authentication auth) {
        service.deleteVehicleDocument(id, com.fleetman.backend.controller.SecurityUtils.getUserId(auth), com.fleetman.backend.controller.SecurityUtils.isAdmin(auth), com.fleetman.backend.controller.SecurityUtils.getOrganizationId(auth));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/drivers")
    public ResponseEntity<DriverDocumentEntity> createDriverDoc(@RequestBody DriverDocumentEntity req, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createDriverDocument(req, com.fleetman.backend.controller.SecurityUtils.getUserId(auth), com.fleetman.backend.controller.SecurityUtils.isAdmin(auth), com.fleetman.backend.controller.SecurityUtils.getOrganizationId(auth)));
    }

    @GetMapping("/drivers")
    public ResponseEntity<List<DriverDocumentEntity>> driverDocs(@RequestParam(required = false) UUID driverId, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(service.driverDocuments(driverId, com.fleetman.backend.controller.SecurityUtils.getUserId(auth), com.fleetman.backend.controller.SecurityUtils.isAdmin(auth), com.fleetman.backend.controller.SecurityUtils.getOrganizationId(auth)));
    }

    @DeleteMapping("/drivers/{id}")
    public ResponseEntity<Void> deleteDriverDoc(@PathVariable UUID id, org.springframework.security.core.Authentication auth) {
        service.deleteDriverDocument(id, com.fleetman.backend.controller.SecurityUtils.getUserId(auth), com.fleetman.backend.controller.SecurityUtils.isAdmin(auth), com.fleetman.backend.controller.SecurityUtils.getOrganizationId(auth));
        return ResponseEntity.noContent().build();
    }
}

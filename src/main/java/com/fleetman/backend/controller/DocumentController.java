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
    public ResponseEntity<VehicleDocumentEntity> createVehicleDoc(@RequestBody VehicleDocumentEntity req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createVehicleDocument(req));
    }

    @GetMapping("/vehicles")
    public ResponseEntity<List<VehicleDocumentEntity>> vehicleDocs(@RequestParam(required = false) UUID vehicleId) {
        return ResponseEntity.ok(service.vehicleDocuments(vehicleId));
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<Void> deleteVehicleDoc(@PathVariable UUID id) {
        service.deleteVehicleDocument(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/drivers")
    public ResponseEntity<DriverDocumentEntity> createDriverDoc(@RequestBody DriverDocumentEntity req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createDriverDocument(req));
    }

    @GetMapping("/drivers")
    public ResponseEntity<List<DriverDocumentEntity>> driverDocs(@RequestParam(required = false) UUID driverId) {
        return ResponseEntity.ok(service.driverDocuments(driverId));
    }

    @DeleteMapping("/drivers/{id}")
    public ResponseEntity<Void> deleteDriverDoc(@PathVariable UUID id) {
        service.deleteDriverDocument(id);
        return ResponseEntity.noContent().build();
    }
}

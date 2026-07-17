package com.fleetman.backend.controller;

import com.fleetman.backend.entity.VehicleIllustrationImageEntity;
import com.fleetman.backend.service.VehicleMediaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Tag(name = "09a. Vehicules: Parc")
@RestController
@RequestMapping("/api/v1/vehicles/{vehicleId}/media")
public class VehicleMediaController {

    private final VehicleMediaService service;

    public VehicleMediaController(VehicleMediaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<VehicleIllustrationImageEntity>> list(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(service.list(vehicleId));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<VehicleIllustrationImageEntity> add(@PathVariable UUID vehicleId,
                                                             @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addImage(vehicleId, file));
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> delete(@PathVariable UUID vehicleId, @PathVariable UUID imageId) {
        service.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }
}

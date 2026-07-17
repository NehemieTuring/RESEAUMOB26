package com.fleetman.backend.controller;

import com.fleetman.backend.entity.GeofenceZoneEntity;
import com.fleetman.backend.service.GeofenceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "26. Geofence")
@RestController
@RequestMapping("/api/v1/geofences")
public class GeofenceController {

    private final GeofenceService service;

    public GeofenceController(GeofenceService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<GeofenceZoneEntity> create(Authentication auth, @RequestBody GeofenceZoneEntity req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createZone(req, SecurityUtils.getUserId(auth)));
    }

    @GetMapping
    public ResponseEntity<List<GeofenceZoneEntity>> list(@RequestParam(required = false) String category) {
        return ResponseEntity.ok(service.listZones(category));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<GeofenceZoneEntity>> mine(Authentication auth) {
        return ResponseEntity.ok(service.getZonesByManager(SecurityUtils.getUserId(auth)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GeofenceZoneEntity> update(@PathVariable UUID id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(service.updateZone(id, updates));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteZone(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/check")
    public ResponseEntity<Map<String, Boolean>> check(@PathVariable UUID id,
                                                      @RequestParam double lat, @RequestParam double lng) {
        return ResponseEntity.ok(Map.of("inside", service.checkPointInZone(id, lat, lng)));
    }
}

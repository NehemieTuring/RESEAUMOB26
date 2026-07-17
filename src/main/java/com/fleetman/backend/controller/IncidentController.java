package com.fleetman.backend.controller;

import com.fleetman.backend.entity.IncidentEntity;
import com.fleetman.backend.service.IncidentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "13. Operations: Incidents")
@RestController
@RequestMapping("/api/v1/incidents")
public class IncidentController {

    private final IncidentService service;

    public IncidentController(IncidentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<IncidentEntity> create(@RequestBody IncidentEntity req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @GetMapping
    public ResponseEntity<List<IncidentEntity>> list(@RequestParam(required = false) UUID vehicleId) {
        return ResponseEntity.ok(service.list(vehicleId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentEntity> get(@PathVariable UUID id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncidentEntity> update(@PathVariable UUID id, @RequestBody IncidentEntity req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

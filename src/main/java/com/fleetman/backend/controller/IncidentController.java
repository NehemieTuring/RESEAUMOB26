package com.fleetman.backend.controller;

import com.fleetman.backend.entity.IncidentEntity;
import com.fleetman.backend.repository.IncidentRepository;
import com.fleetman.backend.service.IncidentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Tag(name = "13. Operations: Incidents")
@RestController
@RequestMapping("/api/v1/operations/incidents")
public class IncidentController {

    private final IncidentService service;
    private final IncidentRepository repository;

    public IncidentController(IncidentService service, IncidentRepository repository) {
        this.service = service;
        this.repository = repository;
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

    @PatchMapping("/{id}/status")
    public ResponseEntity<IncidentEntity> updateStatus(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        IncidentEntity e = service.get(id);
        Object st = body.get("status");
        if (st != null) e.setStatus(st.toString());
        return ResponseEntity.ok(repository.save(e));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<IncidentEntity>> byVehicle(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(repository.findByVehicleIdAndDeletedFalse(vehicleId));
    }

    @GetMapping("/vehicle/{vehicleId}/cost")
    public ResponseEntity<Map<String, Object>> vehicleCost(@PathVariable UUID vehicleId) {
        double total = repository.findByVehicleIdAndDeletedFalse(vehicleId).stream()
                .filter(i -> i.getCost() != null)
                .mapToDouble(i -> i.getCost().doubleValue()).sum();
        return ResponseEntity.ok(Map.of("vehicleId", vehicleId, "totalCost", total));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<IncidentEntity>> byDriver(@PathVariable UUID driverId) {
        return ResponseEntity.ok(repository.findByDeletedFalse().stream()
                .filter(i -> driverId.equals(i.getDriverId())).collect(Collectors.toList()));
    }

    @GetMapping("/open")
    public ResponseEntity<List<IncidentEntity>> open() {
        return ResponseEntity.ok(repository.findByDeletedFalse().stream()
                .filter(i -> i.getStatus() == null || !"CLOSED".equalsIgnoreCase(i.getStatus()))
                .collect(Collectors.toList()));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<IncidentEntity>> filter(@RequestParam(required = false) String type,
                                                       @RequestParam(required = false) String severity,
                                                       @RequestParam(required = false) String status) {
        return ResponseEntity.ok(repository.findByDeletedFalse().stream()
                .filter(i -> type == null || type.equalsIgnoreCase(i.getType()))
                .filter(i -> severity == null || severity.equalsIgnoreCase(i.getSeverity()))
                .filter(i -> status == null || status.equalsIgnoreCase(i.getStatus()))
                .collect(Collectors.toList()));
    }

    @GetMapping("/range")
    public ResponseEntity<List<IncidentEntity>> range(@RequestParam Instant start, @RequestParam Instant end) {
        return ResponseEntity.ok(repository.findByDeletedFalse().stream()
                .filter(i -> i.getIncidentDateTime() != null
                        && !i.getIncidentDateTime().isBefore(start) && !i.getIncidentDateTime().isAfter(end))
                .collect(Collectors.toList()));
    }
}

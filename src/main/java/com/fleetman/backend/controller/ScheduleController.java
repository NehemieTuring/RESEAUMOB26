package com.fleetman.backend.controller;

import com.fleetman.backend.entity.ScheduleEntity;
import com.fleetman.backend.service.ScheduleService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "17a. Planning: Schedules")
@RestController
@RequestMapping("/api/v1/schedules")
public class ScheduleController {

    private final ScheduleService service;

    public ScheduleController(ScheduleService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ScheduleEntity> create(@RequestBody ScheduleEntity req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @GetMapping
    public ResponseEntity<List<ScheduleEntity>> list(@RequestParam(required = false) UUID fleetId) {
        return ResponseEntity.ok(service.list(fleetId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScheduleEntity> get(@PathVariable UUID id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScheduleEntity> update(@PathVariable UUID id, @RequestBody ScheduleEntity req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

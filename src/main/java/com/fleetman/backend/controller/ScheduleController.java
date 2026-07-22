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
    public ResponseEntity<ScheduleEntity> create(@RequestBody ScheduleEntity req, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req, SecurityUtils.getUserId(auth)));
    }

    @GetMapping
    public ResponseEntity<List<ScheduleEntity>> list(@RequestParam(required = false) UUID fleetId, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(service.list(fleetId, SecurityUtils.getUserId(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScheduleEntity> get(@PathVariable UUID id, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(service.get(id, SecurityUtils.getUserId(auth)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScheduleEntity> update(@PathVariable UUID id, @RequestBody ScheduleEntity req, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(service.update(id, req, SecurityUtils.getUserId(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, org.springframework.security.core.Authentication auth) {
        service.delete(id, SecurityUtils.getUserId(auth));
        return ResponseEntity.noContent().build();
    }
}

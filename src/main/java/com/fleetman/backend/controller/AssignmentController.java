package com.fleetman.backend.controller;

import com.fleetman.backend.entity.AssignmentEntity;
import com.fleetman.backend.service.AssignmentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "17b. Planning: Assignments")
@RestController
@RequestMapping("/api/v1/assignments")
public class AssignmentController {

    private final AssignmentService service;

    public AssignmentController(AssignmentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<AssignmentEntity> create(@RequestBody AssignmentEntity req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @GetMapping
    public ResponseEntity<List<AssignmentEntity>> list(@RequestParam(required = false) UUID scheduleId,
                                                       @RequestParam(required = false) UUID fleetId) {
        return ResponseEntity.ok(service.list(scheduleId, fleetId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentEntity> get(@PathVariable UUID id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssignmentEntity> update(@PathVariable UUID id, @RequestBody AssignmentEntity req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

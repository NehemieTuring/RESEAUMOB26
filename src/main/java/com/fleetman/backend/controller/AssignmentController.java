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
    public ResponseEntity<AssignmentEntity> create(@RequestBody AssignmentEntity req, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req, SecurityUtils.getUserId(auth)));
    }

    @GetMapping
    public ResponseEntity<List<AssignmentEntity>> list(@RequestParam(required = false) UUID scheduleId,
                                                       @RequestParam(required = false) UUID fleetId, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(service.list(scheduleId, fleetId, SecurityUtils.getUserId(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentEntity> get(@PathVariable UUID id, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(service.get(id, SecurityUtils.getUserId(auth)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssignmentEntity> update(@PathVariable UUID id, @RequestBody AssignmentEntity req, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(service.update(id, req, SecurityUtils.getUserId(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, org.springframework.security.core.Authentication auth) {
        service.delete(id, SecurityUtils.getUserId(auth));
        return ResponseEntity.noContent().build();
    }
}

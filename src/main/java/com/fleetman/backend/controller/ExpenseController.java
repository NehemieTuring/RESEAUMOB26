package com.fleetman.backend.controller;

import com.fleetman.backend.controller.dto.CancelTripRequest;
import com.fleetman.backend.entity.ExpenseEntity;
import com.fleetman.backend.service.ExpenseService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "18. Depenses")
@RestController
@RequestMapping("/api/v1/expenses")
public class ExpenseController {

    private final ExpenseService service;

    public ExpenseController(ExpenseService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ExpenseEntity> create(@RequestBody ExpenseEntity req, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req, com.fleetman.backend.controller.SecurityUtils.getUserId(auth)));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseEntity>> list(@RequestParam(required = false) UUID fleetId,
                                                    org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(service.list(fleetId, com.fleetman.backend.controller.SecurityUtils.getUserId(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseEntity> get(@PathVariable UUID id, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(service.get(id, com.fleetman.backend.controller.SecurityUtils.getUserId(auth)));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ExpenseEntity> approve(@PathVariable UUID id, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(service.approve(id, com.fleetman.backend.controller.SecurityUtils.getUserId(auth)));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ExpenseEntity> reject(@PathVariable UUID id, @RequestBody CancelTripRequest req, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(service.reject(id, req.reason(), com.fleetman.backend.controller.SecurityUtils.getUserId(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, org.springframework.security.core.Authentication auth) {
        service.delete(id, com.fleetman.backend.controller.SecurityUtils.getUserId(auth));
        return ResponseEntity.noContent().build();
    }
}

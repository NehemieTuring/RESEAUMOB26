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
    public ResponseEntity<ExpenseEntity> create(@RequestBody ExpenseEntity req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseEntity>> list(@RequestParam(required = false) UUID fleetId,
                                                    @RequestParam(required = false) UUID managerId) {
        return ResponseEntity.ok(service.list(fleetId, managerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseEntity> get(@PathVariable UUID id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ExpenseEntity> approve(@PathVariable UUID id) {
        return ResponseEntity.ok(service.approve(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ExpenseEntity> reject(@PathVariable UUID id, @RequestBody CancelTripRequest req) {
        return ResponseEntity.ok(service.reject(id, req.reason()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

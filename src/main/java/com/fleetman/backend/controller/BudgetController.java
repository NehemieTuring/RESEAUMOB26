package com.fleetman.backend.controller;

import com.fleetman.backend.entity.BudgetEntity;
import com.fleetman.backend.service.BudgetService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "19. Budgets")
@RestController
@RequestMapping("/api/v1/budgets")
public class BudgetController {

    private final BudgetService service;

    public BudgetController(BudgetService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<BudgetEntity> create(@RequestBody BudgetEntity req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @GetMapping
    public ResponseEntity<List<BudgetEntity>> list(Authentication auth) {
        return ResponseEntity.ok(service.listByManager(SecurityUtils.getUserId(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetEntity> get(@PathVariable UUID id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetEntity> update(@PathVariable UUID id, @RequestBody BudgetEntity req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

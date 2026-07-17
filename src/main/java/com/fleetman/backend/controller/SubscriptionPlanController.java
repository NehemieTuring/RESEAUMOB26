package com.fleetman.backend.controller;

import com.fleetman.backend.entity.SubscriptionPlanEntity;
import com.fleetman.backend.service.SubscriptionPlanService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "27. Souscriptions")
@RestController
@RequestMapping("/api/v1/subscription-plans")
public class SubscriptionPlanController {

    private final SubscriptionPlanService service;

    public SubscriptionPlanController(SubscriptionPlanService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<SubscriptionPlanEntity> create(@RequestBody SubscriptionPlanEntity req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionPlanEntity>> list(@RequestParam(defaultValue = "false") boolean activeOnly) {
        return ResponseEntity.ok(service.list(activeOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionPlanEntity> get(@PathVariable UUID id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionPlanEntity> update(@PathVariable UUID id, @RequestBody SubscriptionPlanEntity req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

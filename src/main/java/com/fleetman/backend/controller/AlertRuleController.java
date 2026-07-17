package com.fleetman.backend.controller;

import com.fleetman.backend.entity.AlertRuleEntity;
import com.fleetman.backend.service.AlertRuleEngineService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "22. Alertes & Regles")
@RestController
@RequestMapping("/api/v1/alert-rules")
public class AlertRuleController {

    private final AlertRuleEngineService service;

    public AlertRuleController(AlertRuleEngineService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<AlertRuleEntity> create(@RequestBody AlertRuleEntity req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createRule(req));
    }

    @GetMapping
    public ResponseEntity<List<AlertRuleEntity>> list(Authentication auth) {
        return ResponseEntity.ok(service.rulesByManager(SecurityUtils.getUserId(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlertRuleEntity> get(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getRule(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlertRuleEntity> update(@PathVariable UUID id, @RequestBody AlertRuleEntity req) {
        return ResponseEntity.ok(service.updateRule(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteRule(id);
        return ResponseEntity.noContent().build();
    }
}

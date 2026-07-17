package com.fleetman.backend.controller;

import com.fleetman.backend.entity.AlertEventEntity;
import com.fleetman.backend.service.AlertRuleEngineService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "22. Alertes & Regles")
@RestController
@RequestMapping("/api/v1/alert-events")
public class AlertEventController {

    private final AlertRuleEngineService service;

    public AlertEventController(AlertRuleEngineService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AlertEventEntity>> list(@RequestParam(required = false) UUID ruleId) {
        return ResponseEntity.ok(service.eventsByRule(ruleId));
    }

    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<AlertEventEntity> acknowledge(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(service.acknowledge(id, SecurityUtils.getUserId(auth)));
    }
}

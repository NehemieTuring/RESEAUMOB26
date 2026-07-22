package com.fleetman.backend.controller;

import com.fleetman.backend.entity.FleetManagerEntity;
import com.fleetman.backend.service.FleetManagerService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Tag(name = "08. Fleet Managers")
@RestController
@RequestMapping("/api/v1/fleet-managers")
public class FleetManagerController {

    private final FleetManagerService service;

    public FleetManagerController(FleetManagerService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<FleetManagerEntity>> list() {
        return ResponseEntity.ok(service.list());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<FleetManagerEntity> get(@PathVariable UUID userId) {
        return ResponseEntity.ok(service.get(userId));
    }

    @PutMapping("/me/company")
    public ResponseEntity<FleetManagerEntity> updateCompany(Authentication auth,
                                                           @RequestBody FleetManagerEntity req) {
        return ResponseEntity.ok(service.updateCompany(SecurityUtils.getUserId(auth), req));
    }

    @PostMapping(value = "/me/company/logo", consumes = "multipart/form-data")
    public ResponseEntity<FleetManagerEntity> uploadCompanyLogo(Authentication auth,
                                                                @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(service.uploadCompanyLogo(SecurityUtils.getUserId(auth), file));
    }
}

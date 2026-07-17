package com.fleetman.backend.controller;

import com.fleetman.backend.controller.dto.RegisterRequest;
import com.fleetman.backend.controller.dto.UserDetail;
import com.fleetman.backend.service.SuperAdminService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "03. Super Administration")
@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('FLEET_SUPER_ADMIN')")
public class SuperAdminController {

    private final SuperAdminService service;

    public SuperAdminController(SuperAdminService service) {
        this.service = service;
    }

    @PostMapping("/admins")
    public ResponseEntity<UserDetail> createAdmin(@RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createAdmin(req));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserDetail> getUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(service.getUser(userId));
    }

    @PostMapping("/users/{userId}/roles")
    public ResponseEntity<Void> assignRoles(@PathVariable UUID userId, @RequestBody List<String> roles) {
        service.assignRoles(userId, roles);
        return ResponseEntity.ok().build();
    }
}

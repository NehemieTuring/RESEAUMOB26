package com.fleetman.backend.controller;

import com.fleetman.backend.controller.dto.UserDetail;
import com.fleetman.backend.service.AdminService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "04. Admin: Managers")
@RestController
@RequestMapping("/api/v1/admin/managers")
@PreAuthorize("hasAnyRole('FLEET_ADMIN','FLEET_SUPER_ADMIN')")
public class AdminManagerController {

    private final AdminService service;

    public AdminManagerController(AdminService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<UserDetail>> list(Authentication auth) {
        return ResponseEntity.ok(service.listManagers(SecurityUtils.getOrganizationId(auth)));
    }

    @PostMapping
    public ResponseEntity<UserDetail> createManager(Authentication auth, @RequestBody com.fleetman.backend.controller.dto.RegisterRequest req) {
        UUID orgId = SecurityUtils.getOrganizationId(auth);
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(service.createManager(req, orgId));
    }

    @PostMapping("/{userId}/activate")
    public ResponseEntity<UserDetail> activate(@PathVariable UUID userId, Authentication auth) {
        return ResponseEntity.ok(service.setActive(userId, true, SecurityUtils.getOrganizationId(auth)));
    }

    @PostMapping("/{userId}/deactivate")
    public ResponseEntity<UserDetail> deactivate(@PathVariable UUID userId, Authentication auth) {
        return ResponseEntity.ok(service.setActive(userId, false, SecurityUtils.getOrganizationId(auth)));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> delete(@PathVariable UUID userId, Authentication auth) {
        service.deleteUser(userId, SecurityUtils.getOrganizationId(auth));
        return ResponseEntity.noContent().build();
    }
}

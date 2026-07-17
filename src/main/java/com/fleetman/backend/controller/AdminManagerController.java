package com.fleetman.backend.controller;

import com.fleetman.backend.controller.dto.UserDetail;
import com.fleetman.backend.service.AdminService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    public ResponseEntity<List<UserDetail>> list() {
        return ResponseEntity.ok(service.listManagers());
    }

    @PostMapping("/{userId}/activate")
    public ResponseEntity<UserDetail> activate(@PathVariable UUID userId) {
        return ResponseEntity.ok(service.setActive(userId, true));
    }

    @PostMapping("/{userId}/deactivate")
    public ResponseEntity<UserDetail> deactivate(@PathVariable UUID userId) {
        return ResponseEntity.ok(service.setActive(userId, false));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> delete(@PathVariable UUID userId) {
        service.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}

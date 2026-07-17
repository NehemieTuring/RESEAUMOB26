package com.fleetman.backend.service;

import com.fleetman.backend.controller.dto.RegisterRequest;
import com.fleetman.backend.controller.dto.UserDetail;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SuperAdminService {

    private final InternalAuthService authService;

    public SuperAdminService(InternalAuthService authService) {
        this.authService = authService;
    }

    @Transactional
    public UserDetail createAdmin(RegisterRequest req) {
        return authService.register(req).user();
    }

    @Transactional
    public void assignRoles(UUID userId, List<String> roles) {
        authService.assignRoles(userId, roles);
    }

    public UserDetail getUser(UUID userId) {
        return authService.getUserById(userId);
    }
}

package com.fleetman.backend.service;

import com.fleetman.backend.controller.dto.UserDetail;
import com.fleetman.backend.entity.UserEntity;
import com.fleetman.backend.exception.AdminException;
import com.fleetman.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final InternalAuthService authService;

    public AdminService(UserRepository userRepository, InternalAuthService authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    public List<UserDetail> listUsers() {
        return userRepository.findAll().stream()
                .map(u -> authService.loadUserDetail(u.getId()))
                .collect(Collectors.toList());
    }

    public List<UserDetail> listManagers(UUID orgId) {
        return authService.getUsersByService("FLEET_MANAGEMENT", orgId);
    }

    @Transactional
    public UserDetail setActive(UUID userId, boolean active, UUID orgId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> AdminException.notFound(userId));
        if (orgId != null && !orgId.equals(user.getOrganizationId())) {
            throw AdminException.forbidden("Organization mismatch");
        }
        user.setActive(active);
        userRepository.save(user);
        return authService.loadUserDetail(userId);
    }

    @Transactional
    public void deleteUser(UUID userId, UUID orgId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> AdminException.notFound(userId));
        if (orgId != null && !orgId.equals(user.getOrganizationId())) {
            throw AdminException.forbidden("Organization mismatch");
        }
        authService.deleteAccount(userId);
    }

    @Transactional
    public UserDetail createManager(com.fleetman.backend.controller.dto.RegisterRequest cmd, UUID organizationId) {
        // We use authService to create the user, roles, and entities, but we override the default behavior
        // to assign the correct organizationId.
        com.fleetman.backend.controller.dto.AuthResponse res = authService.registerWithOrg(cmd, organizationId);
        return res.user();
    }
}

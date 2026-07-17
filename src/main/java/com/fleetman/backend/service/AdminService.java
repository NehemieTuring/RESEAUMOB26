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

    public List<UserDetail> listManagers() {
        return authService.getUsersByService("FLEET_MANAGEMENT");
    }

    @Transactional
    public UserDetail setActive(UUID userId, boolean active) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> AdminException.notFound(userId));
        user.setActive(active);
        userRepository.save(user);
        return authService.loadUserDetail(userId);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        authService.deleteAccount(userId);
    }
}

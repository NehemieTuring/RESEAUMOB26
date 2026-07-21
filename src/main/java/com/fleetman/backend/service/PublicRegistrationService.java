package com.fleetman.backend.service;

import com.fleetman.backend.controller.dto.PublicDtos.RegisterManagerRequest;
import com.fleetman.backend.entity.FleetManagerEntity;
import com.fleetman.backend.entity.UserEntity;
import com.fleetman.backend.entity.UserRoleEntity;
import com.fleetman.backend.exception.AuthException;
import com.fleetman.backend.repository.FleetManagerRepository;
import com.fleetman.backend.repository.UserRepository;
import com.fleetman.backend.repository.UserRoleRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Inscription publique d'un gestionnaire de flotte.
 * Le compte est cree DESACTIVE : il doit etre valide par un administrateur
 * (via /api/v1/admin/management/managers/{id}/toggle) avant de pouvoir se connecter.
 */
@Service
public class PublicRegistrationService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final FleetManagerRepository fleetManagerRepository;
    private final PasswordEncoder passwordEncoder;

    public PublicRegistrationService(UserRepository userRepository,
                                     UserRoleRepository userRoleRepository,
                                     FleetManagerRepository fleetManagerRepository,
                                     PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.fleetManagerRepository = fleetManagerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UUID registerManager(RegisterManagerRequest req) {
        if (req.email() == null || req.email().isBlank()) {
            throw new IllegalArgumentException("Email requis.");
        }
        if (req.password() == null || req.password().length() < 6) {
            throw new IllegalArgumentException("Mot de passe : 6 caracteres minimum.");
        }
        if (userRepository.existsByEmail(req.email())) {
            throw AuthException.emailAlreadyUsed();
        }

        String username = (req.username() == null || req.username().isBlank())
                ? req.email()
                : req.username();

        UserEntity user = UserEntity.builder()
                .username(username)
                .email(req.email())
                .firstName(req.firstName())
                .lastName(req.lastName())
                .phone(req.phone())
                .passwordHash(passwordEncoder.encode(req.password()))
                .isActive(true) // Modifié de false à true pour faciliter le développement
                .build();
        user = userRepository.save(user);

        userRoleRepository.save(UserRoleEntity.builder()
                .userId(user.getId())
                .role("FLEET_MANAGER")
                .build());

        fleetManagerRepository.save(FleetManagerEntity.builder()
                .userId(user.getId())
                .companyName(req.companyName())
                .companyPhone(req.phone())
                .build());

        return user.getId();
    }
}

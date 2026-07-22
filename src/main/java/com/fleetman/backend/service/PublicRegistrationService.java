package com.fleetman.backend.service;

import com.fleetman.backend.controller.dto.PublicDtos.RegisterManagerRequest;
import com.fleetman.backend.entity.FleetManagerEntity;
import com.fleetman.backend.entity.OrganizationEntity;
import com.fleetman.backend.entity.UserEntity;
import com.fleetman.backend.entity.UserRoleEntity;
import com.fleetman.backend.exception.AuthException;
import com.fleetman.backend.repository.FleetManagerRepository;
import com.fleetman.backend.repository.OrganizationRepository;
import com.fleetman.backend.repository.UserRepository;
import com.fleetman.backend.repository.UserRoleRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Inscription publique d'un gestionnaire de flotte.
 * Cree une Organisation + Admin + FleetManager systeme dans une seule transaction.
 * En cas d'erreur (doublon nom, email, etc.), toute la transaction est annulee.
 */
@Service
public class PublicRegistrationService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final FleetManagerRepository fleetManagerRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;

    public PublicRegistrationService(UserRepository userRepository,
                                     UserRoleRepository userRoleRepository,
                                     FleetManagerRepository fleetManagerRepository,
                                     OrganizationRepository organizationRepository,
                                     PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.fleetManagerRepository = fleetManagerRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UUID registerManager(RegisterManagerRequest req) {
        // --- Validations ---
        if (req.email() == null || req.email().isBlank()) {
            throw new IllegalArgumentException("Email requis.");
        }
        if (req.password() == null || req.password().length() < 6) {
            throw new IllegalArgumentException("Mot de passe : 6 caracteres minimum.");
        }
        if (userRepository.existsByEmail(req.email())) {
            throw AuthException.emailAlreadyUsed();
        }

        // --- 1) Creer l'organisation ---
        String orgName = (req.companyName() != null && !req.companyName().isBlank())
                ? req.companyName()
                : req.email(); // fallback sur l'email si pas de nom
        if (organizationRepository.existsByName(orgName)) {
            throw new IllegalArgumentException("Une organisation avec ce nom existe deja : " + orgName);
        }

        OrganizationEntity organization = OrganizationEntity.builder()
                .name(orgName)
                .build();
        organization = organizationRepository.save(organization);

        // --- 2) Creer l'utilisateur avec organizationId ---
        String base = (req.username() == null || req.username().isBlank())
                ? req.email()
                : req.username();
        String username = base;
        int suffix = 1;
        while (userRepository.existsByUsername(username)) {
            username = base + suffix;
            suffix++;
        }

        UserEntity user = UserEntity.builder()
                .username(username)
                .email(req.email())
                .firstName(req.firstName())
                .lastName(req.lastName())
                .phone(req.phone())
                .passwordHash(passwordEncoder.encode(req.password()))
                .organizationId(organization.getId())
                .isActive(true)
                .build();
        user = userRepository.save(user);

        // --- 3) Roles : FLEET_ADMIN + FLEET_MANAGER ---
        userRoleRepository.save(UserRoleEntity.builder()
                .userId(user.getId())
                .role("FLEET_ADMIN")
                .build());

        userRoleRepository.save(UserRoleEntity.builder()
                .userId(user.getId())
                .role("FLEET_MANAGER")
                .build());

        // --- 4) FleetManager "systeme" ---
        fleetManagerRepository.save(FleetManagerEntity.builder()
                .userId(user.getId())
                .companyName(req.companyName())
                .companyPhone(req.phone())
                .build());

        return user.getId();
    }
}

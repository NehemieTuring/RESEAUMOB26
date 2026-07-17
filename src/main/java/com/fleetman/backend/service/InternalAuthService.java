package com.fleetman.backend.service;

import com.fleetman.backend.config.security.JwtUtil;
import com.fleetman.backend.controller.dto.*;
import com.fleetman.backend.entity.*;
import com.fleetman.backend.exception.AuthException;
import com.fleetman.backend.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Authentification locale remplacant le Kernel RT-Comops.
 * Gere les utilisateurs, les roles, le JWT et l'enrichissement des UserDetail.
 */
@Service
public class InternalAuthService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final FleetManagerRepository fleetManagerRepository;
    private final DriverRepository driverRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final FileStorageService fileStorageService;

    public InternalAuthService(UserRepository userRepository,
                               UserRoleRepository userRoleRepository,
                               FleetManagerRepository fleetManagerRepository,
                               DriverRepository driverRepository,
                               PasswordEncoder passwordEncoder,
                               JwtUtil jwtUtil,
                               FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.fleetManagerRepository = fleetManagerRepository;
        this.driverRepository = driverRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.fileStorageService = fileStorageService;
    }

    // ----- Authentification -----

    @Transactional
    public AuthResponse login(String identifier, String password) {
        UserEntity user = userRepository.findByEmailOrUsername(identifier)
                .orElseThrow(AuthException::invalidCredentials);
        if (!user.isActive()) throw AuthException.accountDisabled();
        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw AuthException.invalidCredentials();
        }
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse register(RegisterRequest cmd) {
        if (cmd.email() != null && userRepository.existsByEmail(cmd.email())) {
            throw AuthException.emailAlreadyUsed();
        }
        UserEntity user = UserEntity.builder()
                .username(cmd.username())
                .email(cmd.email())
                .phone(cmd.phone())
                .firstName(cmd.firstName())
                .lastName(cmd.lastName())
                .passwordHash(passwordEncoder.encode(
                        cmd.password() != null ? cmd.password() : UUID.randomUUID().toString()))
                .isActive(true)
                .build();
        user = userRepository.save(user);

        List<String> roles = (cmd.roles() == null || cmd.roles().isEmpty())
                ? List.of("FLEET_MANAGER") : cmd.roles();
        assignRoles(user.getId(), roles);

        if (roles.contains("FLEET_MANAGER")) {
            if (!fleetManagerRepository.existsById(user.getId())) {
                fleetManagerRepository.save(FleetManagerEntity.builder()
                        .userId(user.getId())
                        .build());
            }
        }
        if (roles.contains("FLEET_DRIVER")) {
            if (!driverRepository.existsById(user.getId())) {
                driverRepository.save(DriverEntity.builder()
                        .userId(user.getId())
                        .status("ACTIVE")
                        .build());
            }
        }
        return buildAuthResponse(user);
    }

    @Transactional
    public void assignRoles(UUID userId, List<String> roles) {
        for (String role : roles) {
            if (!userRoleRepository.existsByUserIdAndRole(userId, role)) {
                userRoleRepository.save(UserRoleEntity.builder()
                        .userId(userId).role(role).build());
            }
        }
    }

    public UserDetail me(UUID userId) {
        return loadUserDetail(userId);
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtil.isValid(refreshToken)) throw AuthException.invalidToken();
        UUID userId = jwtUtil.extractUserId(refreshToken);
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(AuthException::userNotFound);
        return buildAuthResponse(user);
    }

    public UserDetail getUserById(UUID userId) {
        return loadUserDetail(userId);
    }

    public List<UserDetail> getUsersByService(String serviceName) {
        if ("DRIVERS".equalsIgnoreCase(serviceName)) {
            return driverRepository.findAll().stream()
                    .map(d -> loadUserDetail(d.getUserId()))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        }
        // FLEET_MANAGEMENT par defaut -> managers
        return fleetManagerRepository.findAll().stream()
                .map(m -> loadUserDetail(m.getUserId()))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDetail updateUserProfile(UUID userId, UpdateProfileRequest cmd) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(AuthException::userNotFound);
        if (cmd.firstName() != null) user.setFirstName(cmd.firstName());
        if (cmd.lastName() != null) user.setLastName(cmd.lastName());
        if (cmd.phone() != null) user.setPhone(cmd.phone());
        userRepository.save(user);
        return loadUserDetail(userId);
    }

    @Transactional
    public void changePassword(UUID userId, String currentPwd, String newPwd) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(AuthException::userNotFound);
        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(currentPwd, user.getPasswordHash())) {
            throw AuthException.invalidCredentials();
        }
        user.setPasswordHash(passwordEncoder.encode(newPwd));
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(UUID userId) {
        userRoleRepository.deleteByUserId(userId);
        if (driverRepository.existsById(userId)) driverRepository.deleteById(userId);
        if (fleetManagerRepository.existsById(userId)) fleetManagerRepository.deleteById(userId);
        userRepository.deleteById(userId);
    }

    @Transactional
    public UserDetail updateProfilePicture(UUID userId, MultipartFile file) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(AuthException::userNotFound);
        String path = fileStorageService.store(file, userId, "USER", "PROFILE");
        user.setPhotoUrl(path);
        userRepository.save(user);
        return loadUserDetail(userId);
    }

    // ----- Multi-contexte simule -----

    public ContextsResponse discoverContexts(String principal, String password) {
        // Verifie les identifiants puis retourne un contexte unique simule.
        UserEntity user = userRepository.findByEmailOrUsername(principal)
                .orElseThrow(AuthException::invalidCredentials);
        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw AuthException.invalidCredentials();
        }
        String selectionToken = jwtUtil.generateToken(loadUserDetail(user.getId()));
        var ctx = new ContextsResponse.ContextInfo("default", "FleetMan", user.getOrganizationId());
        return new ContextsResponse(selectionToken, 300, List.of(ctx));
    }

    public AuthResponse selectContext(String selectionToken, String contextId, UUID organizationId) {
        if (!jwtUtil.isValid(selectionToken)) throw AuthException.invalidToken();
        UUID userId = jwtUtil.extractUserId(selectionToken);
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(AuthException::userNotFound);
        return buildAuthResponse(user);
    }

    // ----- Helpers -----

    private AuthResponse buildAuthResponse(UserEntity user) {
        UserDetail detail = loadUserDetail(user.getId());
        String access = jwtUtil.generateToken(detail);
        String refresh = jwtUtil.generateRefreshToken(detail);
        return new AuthResponse(access, refresh, detail);
    }

    /** Construit le UserDetail enrichi (roles, entreprise, vehicule) depuis la BDD. */
    public UserDetail loadUserDetail(UUID userId) {
        UserEntity user = userRepository.findById(userId).orElse(null);
        if (user == null) return null;

        List<String> roles = userRoleRepository.findByUserId(userId).stream()
                .map(UserRoleEntity::getRole)
                .collect(Collectors.toList());
        if (roles.isEmpty()) roles = new ArrayList<>();

        List<String> permissions = derivePermissions(roles);
        String service = roles.contains("FLEET_DRIVER") ? "DRIVERS" : "FLEET_MANAGEMENT";

        String companyName = null, companyPhone = null, companyAddress = null,
                companyCity = null, companyLogoUrl = null;
        FleetManagerEntity mgr = fleetManagerRepository.findById(userId).orElse(null);
        if (mgr != null) {
            companyName = mgr.getCompanyName();
            companyPhone = mgr.getCompanyPhone();
            companyAddress = mgr.getCompanyAddress();
            companyCity = mgr.getCompanyCity();
            companyLogoUrl = mgr.getCompanyLogoUrl();
        }

        String licenceNumber = null, vehicleId = null;
        DriverEntity driver = driverRepository.findById(userId).orElse(null);
        if (driver != null) {
            licenceNumber = driver.getLicenceNumber();
            vehicleId = driver.getAssignedVehicleId() != null
                    ? driver.getAssignedVehicleId().toString() : null;
        }

        return new UserDetail(
                user.getId(), user.getUsername(), user.getEmail(), user.getPhone(),
                user.getFirstName(), user.getLastName(), service, roles, permissions,
                user.getPhotoUrl(), companyName, licenceNumber, vehicleId,
                user.isActive(), user.getLastLoginAt(),
                companyPhone, companyAddress, companyCity, companyLogoUrl);
    }

    private List<String> derivePermissions(List<String> roles) {
        Set<String> perms = new LinkedHashSet<>();
        for (String role : roles) {
            switch (role) {
                case "FLEET_SUPER_ADMIN", "FLEET_ADMIN" -> {
                    perms.add("admin:read"); perms.add("admin:write");
                    perms.add("fleet:read"); perms.add("fleet:write");
                }
                case "FLEET_MANAGER" -> {
                    perms.add("fleet:read"); perms.add("fleet:write");
                    perms.add("vehicle:read"); perms.add("vehicle:write");
                }
                case "FLEET_DRIVER" -> {
                    perms.add("trip:read"); perms.add("trip:write");
                }
                default -> { }
            }
        }
        return new ArrayList<>(perms);
    }
}

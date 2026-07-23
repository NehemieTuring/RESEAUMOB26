package com.fleetman.backend.service;

import com.fleetman.backend.controller.dto.*;
import com.fleetman.backend.entity.DriverEntity;
import com.fleetman.backend.entity.UserEntity;
import com.fleetman.backend.exception.DriverException;
import com.fleetman.backend.exception.VehicleException;
import com.fleetman.backend.repository.DriverRepository;
import com.fleetman.backend.repository.FleetRepository;
import com.fleetman.backend.repository.UserRepository;
import com.fleetman.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DriverService {

    private final InternalAuthService authService;
    private final FileStorageService fileStorageService;
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final FleetRepository fleetRepository;

    public DriverService(InternalAuthService authService,
                         FileStorageService fileStorageService,
                         DriverRepository driverRepository,
                         UserRepository userRepository,
                         VehicleRepository vehicleRepository,
                         FleetRepository fleetRepository) {
        this.authService = authService;
        this.fileStorageService = fileStorageService;
        this.driverRepository = driverRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.fleetRepository = fleetRepository;
    }

    @Transactional
    public DriverResponse registerDriverWithPhoto(UUID fleetId, DriverRegistrationRequest req, MultipartFile photo, UUID managerId, boolean isAdmin, UUID orgId) {
        if (managerId != null && fleetId != null) {
            fleetRepository.findById(fleetId).ifPresent(f -> {
                if (!isAdmin && !f.getManagerId().equals(managerId)) {
                    throw new org.springframework.security.access.AccessDeniedException("Vous n'avez pas acces a cette flotte.");
                }
            });
        }
        if (req.licenceNumber() != null && driverRepository.existsByLicenceNumber(req.licenceNumber())) {
            throw DriverException.licenceConflict();
        }
        RegisterRequest register = new RegisterRequest(req.username(), req.password(), req.email(),
                req.phone(), req.firstName(), req.lastName(), List.of("FLEET_DRIVER"));
        
        AuthResponse auth;
        if (orgId != null) {
            auth = authService.registerWithOrg(register, orgId);
        } else {
            auth = authService.register(register);
        }
        
        UUID userId = auth.user().id();

        DriverEntity driver = driverRepository.findById(userId)
                .orElseGet(() -> DriverEntity.builder().userId(userId).build());
        driver.setFleetId(fleetId);
        driver.setManagerId(managerId);
        driver.setLicenceNumber(req.licenceNumber());
        driver.setStatus("ACTIVE");
        if (photo != null && !photo.isEmpty()) {
            String path = fileStorageService.store(photo, userId, "DRIVER", "PHOTO");
            driver.setPhotoUrl(path);
        }
        driverRepository.save(driver);
        return toResponse(driver);
    }

    public List<DriverResponse> list(UUID fleetId, Boolean isAssigned, UUID userId, boolean isAdmin, UUID orgId) {
        List<DriverEntity> drivers;
        if (fleetId != null) {
            if (userId != null) {
                fleetRepository.findById(fleetId).ifPresent(f -> {
                    if (!isAdmin && !f.getManagerId().equals(userId)) {
                        throw new org.springframework.security.access.AccessDeniedException("Vous n'avez pas acces a cette flotte.");
                    }
                });
            }
            drivers = driverRepository.findByFleetId(fleetId);
        } else if (orgId != null) {
            drivers = driverRepository.findAllByOrganizationIdAndDeletedFalse(orgId);
        } else if (userId != null) {
            drivers = driverRepository.findByManagerIdAndDeletedFalseOrNull(userId);
        } else {
            drivers = driverRepository.findAll();
        }
        return drivers.stream()
                .filter(d -> isAssigned == null
                        || (isAssigned == (d.getAssignedVehicleId() != null)))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public DriverResponse get(UUID userId, UUID managerId, boolean isAdmin, UUID orgId) {
        return toResponse(getEntity(userId, managerId, isAdmin, orgId));
    }

    public DriverEntity getEntity(UUID userId, UUID managerId, boolean isAdmin, UUID orgId) {
        DriverEntity driver = driverRepository.findById(userId).orElseThrow(() -> DriverException.notFound(userId));
        if (orgId != null) {
            boolean sameOrg = userRepository.findById(driver.getUserId())
                    .map(u -> orgId.equals(u.getOrganizationId())).orElse(false);
            if (sameOrg) return driver;
            throw new org.springframework.security.access.AccessDeniedException("Ce conducteur n'appartient pas a votre organisation.");
        } else if (managerId != null) {
            if (managerId.equals(driver.getManagerId())) return driver;
            throw new org.springframework.security.access.AccessDeniedException("Vous n'avez pas acces a ce conducteur.");
        }
        return driver;
    }

    public DriverResponse search(String identifier, UUID managerId, boolean isAdmin, UUID orgId) {
        UserEntity user = userRepository.findByEmailOrUsername(identifier)
                .orElseThrow(() -> DriverException.notFound(identifier));
        return toResponse(getEntity(user.getId(), managerId, isAdmin, orgId));
    }

    @Transactional
    public DriverResponse update(UUID userId, UpdateDriverRequest req, UUID managerId, boolean isAdmin, UUID orgId) {
        DriverEntity driver = getEntity(userId, managerId, isAdmin, orgId);
        UserEntity user = userRepository.findById(userId).orElseThrow(() -> DriverException.notFound(userId));
        if (req.firstName() != null) user.setFirstName(req.firstName());
        if (req.lastName() != null) user.setLastName(req.lastName());
        if (req.phone() != null) user.setPhone(req.phone());
        userRepository.save(user);
        if (req.licenceNumber() != null) driver.setLicenceNumber(req.licenceNumber());
        if (req.status() != null) driver.setStatus(req.status());
        driverRepository.save(driver);
        return toResponse(driver);
    }

    @Transactional
    public void assignVehicle(UUID userId, UUID vehicleId, UUID managerId, boolean isAdmin, UUID orgId) {
        DriverEntity driver = getEntity(userId, managerId, isAdmin, orgId);
        var vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> VehicleException.notFound(vehicleId));
        if (driver.getAssignedVehicleId() != null && !driver.getAssignedVehicleId().equals(vehicleId)) {
            vehicleRepository.findById(driver.getAssignedVehicleId()).ifPresent(oldV -> {
                oldV.setCurrentDriverId(null);
                vehicleRepository.save(oldV);
            });
        }
        
        if (vehicle.getCurrentDriverId() != null && !vehicle.getCurrentDriverId().equals(userId)) {
            driverRepository.findById(vehicle.getCurrentDriverId()).ifPresent(oldD -> {
                oldD.setAssignedVehicleId(null);
                driverRepository.save(oldD);
            });
        }

        driver.setAssignedVehicleId(vehicleId);
        driverRepository.save(driver);
        vehicle.setCurrentDriverId(userId);
        vehicleRepository.save(vehicle);
    }

    @Transactional
    public void unassignVehicle(UUID userId, UUID vehicleId, UUID managerId, boolean isAdmin, UUID orgId) {
        DriverEntity driver = getEntity(userId, managerId, isAdmin, orgId);
        driver.setAssignedVehicleId(null);
        driverRepository.save(driver);
        if (vehicleId != null) {
            vehicleRepository.findById(vehicleId).ifPresent(v -> {
                v.setCurrentDriverId(null);
                vehicleRepository.save(v);
            });
        }
    }

    @Transactional
    public void addExistingDriverToFleet(UUID fleetId, String identifier, UUID managerId, boolean isAdmin, UUID orgId) {
        if (managerId != null && fleetId != null) {
            fleetRepository.findById(fleetId).ifPresent(f -> {
                if (!isAdmin && !f.getManagerId().equals(managerId)) {
                    throw new org.springframework.security.access.AccessDeniedException("Vous n'avez pas acces a cette flotte.");
                }
            });
        }
        UserEntity user = userRepository.findByEmailOrUsername(identifier)
                .orElseThrow(() -> DriverException.notFound(identifier));
        DriverEntity driver = driverRepository.findById(user.getId())
                .orElseThrow(() -> DriverException.notFound(identifier));
        driver.setFleetId(fleetId);
        driverRepository.save(driver);
    }

    @Transactional
    public void removeDriverFromFleet(UUID fleetId, UUID driverId, UUID managerId, boolean isAdmin, UUID orgId) {
        DriverEntity driver = getEntity(driverId, managerId, isAdmin, orgId);
        if (fleetId.equals(driver.getFleetId())) {
            driver.setFleetId(null);
            driverRepository.save(driver);
        }
    }

    public DriverResponse toResponse(DriverEntity driver) {
        UserEntity user = userRepository.findById(driver.getUserId()).orElse(null);
        return new DriverResponse(
                driver.getUserId(), driver.getFleetId(), driver.getLicenceNumber(),
                driver.getStatus(), driver.getAssignedVehicleId(), driver.getPhotoUrl(),
                user != null ? user.getUsername() : null,
                user != null ? user.getEmail() : null,
                user != null ? user.getFirstName() : null,
                user != null ? user.getLastName() : null,
                user != null ? user.getPhone() : null,
                user != null && user.isActive(),
                user != null ? user.getLastLoginAt() : null);
    }
}

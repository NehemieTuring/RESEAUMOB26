package com.fleetman.backend.service;

import com.fleetman.backend.controller.dto.*;
import com.fleetman.backend.entity.DriverEntity;
import com.fleetman.backend.entity.UserEntity;
import com.fleetman.backend.exception.DriverException;
import com.fleetman.backend.exception.VehicleException;
import com.fleetman.backend.repository.DriverRepository;
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

    public DriverService(InternalAuthService authService,
                         FileStorageService fileStorageService,
                         DriverRepository driverRepository,
                         UserRepository userRepository,
                         VehicleRepository vehicleRepository) {
        this.authService = authService;
        this.fileStorageService = fileStorageService;
        this.driverRepository = driverRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional
    public DriverResponse registerDriverWithPhoto(UUID fleetId, DriverRegistrationRequest req, MultipartFile photo) {
        if (req.licenceNumber() != null && driverRepository.existsByLicenceNumber(req.licenceNumber())) {
            throw DriverException.licenceConflict();
        }
        RegisterRequest register = new RegisterRequest(req.username(), req.password(), req.email(),
                req.phone(), req.firstName(), req.lastName(), List.of("FLEET_DRIVER"));
        AuthResponse auth = authService.register(register);
        UUID userId = auth.user().id();

        DriverEntity driver = driverRepository.findById(userId)
                .orElseGet(() -> DriverEntity.builder().userId(userId).build());
        driver.setFleetId(fleetId);
        driver.setLicenceNumber(req.licenceNumber());
        driver.setStatus("ACTIVE");
        if (photo != null && !photo.isEmpty()) {
            String path = fileStorageService.store(photo, userId, "DRIVER", "PHOTO");
            driver.setPhotoUrl(path);
        }
        driverRepository.save(driver);
        return toResponse(driver);
    }

    public List<DriverResponse> list(UUID fleetId, Boolean isAssigned) {
        List<DriverEntity> drivers = fleetId != null
                ? driverRepository.findByFleetId(fleetId)
                : driverRepository.findAll();
        return drivers.stream()
                .filter(d -> isAssigned == null
                        || (isAssigned == (d.getAssignedVehicleId() != null)))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public DriverResponse get(UUID userId) {
        return toResponse(getEntity(userId));
    }

    public DriverEntity getEntity(UUID userId) {
        return driverRepository.findById(userId).orElseThrow(() -> DriverException.notFound(userId));
    }

    public DriverResponse search(String identifier) {
        UserEntity user = userRepository.findByEmailOrUsername(identifier)
                .orElseThrow(() -> DriverException.notFound(identifier));
        return toResponse(getEntity(user.getId()));
    }

    @Transactional
    public DriverResponse update(UUID userId, UpdateDriverRequest req) {
        DriverEntity driver = getEntity(userId);
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
    public void assignVehicle(UUID userId, UUID vehicleId) {
        DriverEntity driver = getEntity(userId);
        var vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> VehicleException.notFound(vehicleId));
        driver.setAssignedVehicleId(vehicleId);
        driverRepository.save(driver);
        vehicle.setCurrentDriverId(userId);
        vehicleRepository.save(vehicle);
    }

    @Transactional
    public void unassignVehicle(UUID userId, UUID vehicleId) {
        DriverEntity driver = getEntity(userId);
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
    public void addExistingDriverToFleet(UUID fleetId, String identifier) {
        UserEntity user = userRepository.findByEmailOrUsername(identifier)
                .orElseThrow(() -> DriverException.notFound(identifier));
        DriverEntity driver = driverRepository.findById(user.getId())
                .orElseThrow(() -> DriverException.notFound(identifier));
        driver.setFleetId(fleetId);
        driverRepository.save(driver);
    }

    @Transactional
    public void removeDriverFromFleet(UUID fleetId, UUID driverId) {
        DriverEntity driver = getEntity(driverId);
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

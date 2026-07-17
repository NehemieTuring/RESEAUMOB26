package com.fleetman.backend.service;

import com.fleetman.backend.controller.dto.FleetRequest;
import com.fleetman.backend.controller.dto.FleetResponse;
import com.fleetman.backend.controller.dto.FleetStatsResponse;
import com.fleetman.backend.entity.FleetEntity;
import com.fleetman.backend.entity.VehicleEntity;
import com.fleetman.backend.exception.FleetException;
import com.fleetman.backend.repository.DriverRepository;
import com.fleetman.backend.repository.FleetRepository;
import com.fleetman.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FleetService {

    private final FleetRepository fleetRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;

    public FleetService(FleetRepository fleetRepository,
                        VehicleRepository vehicleRepository,
                        DriverRepository driverRepository) {
        this.fleetRepository = fleetRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
    }

    @Transactional
    public FleetResponse create(FleetRequest req, UUID managerId) {
        FleetEntity fleet = FleetEntity.builder()
                .managerId(managerId)
                .name(req.name())
                .phoneNumber(req.phoneNumber())
                .build();
        return toResponse(fleetRepository.save(fleet));
    }

    public List<FleetResponse> listByManager(UUID managerId) {
        return fleetRepository.findByManagerId(managerId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public FleetResponse get(UUID id) {
        return toResponse(getEntity(id));
    }

    public FleetEntity getEntity(UUID id) {
        return fleetRepository.findById(id).orElseThrow(() -> FleetException.notFound(id));
    }

    @Transactional
    public FleetResponse update(UUID id, FleetRequest req) {
        FleetEntity fleet = getEntity(id);
        if (req.name() != null) fleet.setName(req.name());
        if (req.phoneNumber() != null) fleet.setPhoneNumber(req.phoneNumber());
        return toResponse(fleetRepository.save(fleet));
    }

    @Transactional
    public void delete(UUID id) {
        getEntity(id);
        if (vehicleRepository.countByFleetIdAndDeletedFalse(id) > 0) {
            throw FleetException.cannotDeleteNotEmpty();
        }
        fleetRepository.deleteById(id);
    }

    public List<VehicleEntity> getVehicles(UUID fleetId) {
        return vehicleRepository.findByFleetIdAndDeletedFalse(fleetId);
    }

    @Transactional
    public void addVehicle(UUID fleetId, UUID vehicleId) {
        getEntity(fleetId);
        VehicleEntity v = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> FleetException.notFound(vehicleId));
        if (v.getFleetId() != null && !v.getFleetId().equals(fleetId)) {
            throw FleetException.resourceAlreadyAssigned();
        }
        v.setFleetId(fleetId);
        vehicleRepository.save(v);
    }

    @Transactional
    public void removeVehicle(UUID fleetId, UUID vehicleId) {
        VehicleEntity v = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> FleetException.notFound(vehicleId));
        if (fleetId.equals(v.getFleetId())) {
            v.setFleetId(null);
            vehicleRepository.save(v);
        }
    }

    public FleetStatsResponse stats(UUID fleetId) {
        List<VehicleEntity> vehicles = vehicleRepository.findByFleetIdAndDeletedFalse(fleetId);
        Map<String, Long> byStatus = vehicles.stream()
                .collect(Collectors.groupingBy(VehicleEntity::getStatus, Collectors.counting()));
        Map<String, Long> ordered = new LinkedHashMap<>();
        for (String s : List.of("AVAILABLE", "ON_TRIP", "MAINTENANCE")) {
            ordered.put(s, byStatus.getOrDefault(s, 0L));
        }
        long driverCount = driverRepository.findByFleetId(fleetId).size();
        return new FleetStatsResponse(BigDecimal.ZERO, ordered, driverCount);
    }

    private FleetResponse toResponse(FleetEntity fleet) {
        int count = (int) vehicleRepository.countByFleetIdAndDeletedFalse(fleet.getId());
        return new FleetResponse(fleet.getId(), fleet.getManagerId(), fleet.getName(),
                fleet.getPhoneNumber(), fleet.getCreatedAt(), count);
    }
}

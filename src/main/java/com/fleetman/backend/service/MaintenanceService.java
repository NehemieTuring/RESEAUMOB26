package com.fleetman.backend.service;

import com.fleetman.backend.entity.ExpenseEntity;
import com.fleetman.backend.entity.MaintenanceEntity;
import com.fleetman.backend.entity.VehicleEntity;
import com.fleetman.backend.exception.OperationException;
import com.fleetman.backend.repository.ExpenseRepository;
import com.fleetman.backend.repository.MaintenanceRepository;
import com.fleetman.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final ExpenseRepository expenseRepository;
    private final VehicleRepository vehicleRepository;
    private final InternalNotificationService notificationService;

    public MaintenanceService(MaintenanceRepository maintenanceRepository,
                              ExpenseRepository expenseRepository,
                              VehicleRepository vehicleRepository,
                              InternalNotificationService notificationService) {
        this.maintenanceRepository = maintenanceRepository;
        this.expenseRepository = expenseRepository;
        this.vehicleRepository = vehicleRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public MaintenanceEntity create(MaintenanceEntity maintenance, UUID managerId) {
        if (maintenance.getDateTime() == null) maintenance.setDateTime(Instant.now());
        maintenance.setManagerId(managerId);
        MaintenanceEntity saved = maintenanceRepository.save(maintenance);

        VehicleEntity vehicle = maintenance.getVehicleId() != null
                ? vehicleRepository.findById(maintenance.getVehicleId()).orElse(null) : null;

        // 1) Depense automatique de type MAINTENANCE
        if (maintenance.getCost() != null) {
            expenseRepository.save(ExpenseEntity.builder()
                    .expenseType("MAINTENANCE")
                    .amount(maintenance.getCost())
                    .description("Maintenance : " + maintenance.getSubject())
                    .status("APPROVED")
                    .sourceType("MAINTENANCE")
                    .vehicleId(maintenance.getVehicleId())
                    .vehicleRegistration(maintenance.getVehicleRegistration())
                    .fleetId(vehicle != null ? vehicle.getFleetId() : null)
                    .managerId(vehicle != null ? vehicle.getManagerId() : null)
                    .driverId(maintenance.getDriverId())
                    .driverFullName(maintenance.getDriverFullName())
                    .build());
        }

        // 2) Notification au manager
        if (vehicle != null && vehicle.getManagerId() != null) {
            notificationService.sendNotification(vehicle.getManagerId(),
                    "Nouvelle maintenance",
                    "Maintenance enregistree pour le vehicule " + maintenance.getVehicleRegistration(),
                    "MAINTENANCE");
        }
        return saved;
    }

    public List<MaintenanceEntity> list(UUID vehicleId, UUID managerId) {
        List<MaintenanceEntity> list = managerId != null
                ? maintenanceRepository.findByManagerIdAndDeletedFalse(managerId)
                : maintenanceRepository.findByDeletedFalse();
        if (vehicleId != null) {
            return list.stream().filter(m -> vehicleId.equals(m.getVehicleId())).toList();
        }
        return list;
    }

    public MaintenanceEntity get(UUID id, UUID managerId) {
        MaintenanceEntity m = maintenanceRepository.findById(id).orElseThrow(() -> OperationException.notFound(id));
        if (managerId != null) {
            com.fleetman.backend.controller.SecurityUtils.requireOwnership(m.getManagerId(), managerId);
        }
        return m;
    }

    @Transactional
    public MaintenanceEntity update(UUID id, MaintenanceEntity req, UUID managerId) {
        MaintenanceEntity m = get(id, managerId);
        if (req.getSubject() != null) m.setSubject(req.getSubject());
        if (req.getCost() != null) m.setCost(req.getCost());
        if (req.getReport() != null) m.setReport(req.getReport());
        if (req.getLocationName() != null) m.setLocationName(req.getLocationName());
        return maintenanceRepository.save(m);
    }

    @Transactional
    public void delete(UUID id, UUID managerId) {
        MaintenanceEntity m = get(id, managerId);
        m.setDeleted(true);
        m.setDeletedAt(Instant.now());
        maintenanceRepository.save(m);
    }
}

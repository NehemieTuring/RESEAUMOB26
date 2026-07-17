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
    public MaintenanceEntity create(MaintenanceEntity maintenance) {
        if (maintenance.getDateTime() == null) maintenance.setDateTime(Instant.now());
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

    public List<MaintenanceEntity> list(UUID vehicleId) {
        return vehicleId != null
                ? maintenanceRepository.findByVehicleIdAndDeletedFalse(vehicleId)
                : maintenanceRepository.findByDeletedFalse();
    }

    public MaintenanceEntity get(UUID id) {
        return maintenanceRepository.findById(id).orElseThrow(() -> OperationException.notFound(id));
    }

    @Transactional
    public MaintenanceEntity update(UUID id, MaintenanceEntity req) {
        MaintenanceEntity m = get(id);
        if (req.getSubject() != null) m.setSubject(req.getSubject());
        if (req.getCost() != null) m.setCost(req.getCost());
        if (req.getReport() != null) m.setReport(req.getReport());
        if (req.getLocationName() != null) m.setLocationName(req.getLocationName());
        return maintenanceRepository.save(m);
    }

    @Transactional
    public void delete(UUID id) {
        MaintenanceEntity m = get(id);
        m.setDeleted(true);
        m.setDeletedAt(Instant.now());
        maintenanceRepository.save(m);
    }
}

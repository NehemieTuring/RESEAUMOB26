package com.fleetman.backend.service;

import com.fleetman.backend.entity.ExpenseEntity;
import com.fleetman.backend.entity.FuelRechargeEntity;
import com.fleetman.backend.entity.VehicleEntity;
import com.fleetman.backend.exception.OperationException;
import com.fleetman.backend.repository.ExpenseRepository;
import com.fleetman.backend.repository.FuelRechargeRepository;
import com.fleetman.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class FuelRechargeService {

    private final FuelRechargeRepository fuelRechargeRepository;
    private final ExpenseRepository expenseRepository;
    private final VehicleRepository vehicleRepository;

    public FuelRechargeService(FuelRechargeRepository fuelRechargeRepository,
                               ExpenseRepository expenseRepository,
                               VehicleRepository vehicleRepository) {
        this.fuelRechargeRepository = fuelRechargeRepository;
        this.expenseRepository = expenseRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional
    public FuelRechargeEntity create(FuelRechargeEntity recharge) {
        if (recharge.getRechargeDateTime() == null) recharge.setRechargeDateTime(Instant.now());
        FuelRechargeEntity saved = fuelRechargeRepository.save(recharge);

        if (recharge.getPrice() != null) {
            VehicleEntity vehicle = recharge.getVehicleId() != null
                    ? vehicleRepository.findById(recharge.getVehicleId()).orElse(null) : null;
            expenseRepository.save(ExpenseEntity.builder()
                    .expenseType("FUEL")
                    .amount(recharge.getPrice())
                    .description("Recharge carburant : " + recharge.getStationName())
                    .status("APPROVED")
                    .sourceType("FUEL")
                    .vehicleId(recharge.getVehicleId())
                    .vehicleRegistration(recharge.getVehicleRegistration())
                    .fleetId(vehicle != null ? vehicle.getFleetId() : null)
                    .managerId(vehicle != null ? vehicle.getManagerId() : null)
                    .driverId(recharge.getDriverId())
                    .driverFullName(recharge.getDriverFullName())
                    .build());
        }
        return saved;
    }

    public List<FuelRechargeEntity> list(UUID vehicleId) {
        return vehicleId != null
                ? fuelRechargeRepository.findByVehicleIdAndDeletedFalse(vehicleId)
                : fuelRechargeRepository.findByDeletedFalse();
    }

    public FuelRechargeEntity get(UUID id) {
        return fuelRechargeRepository.findById(id).orElseThrow(() -> OperationException.notFound(id));
    }

    @Transactional
    public void delete(UUID id) {
        FuelRechargeEntity r = get(id);
        r.setDeleted(true);
        r.setDeletedAt(Instant.now());
        fuelRechargeRepository.save(r);
    }
}

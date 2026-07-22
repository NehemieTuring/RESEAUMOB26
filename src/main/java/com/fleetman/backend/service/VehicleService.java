package com.fleetman.backend.service;

import com.fleetman.backend.controller.dto.VehicleDetailResponse;
import com.fleetman.backend.controller.dto.VehicleRequest;
import com.fleetman.backend.entity.*;
import com.fleetman.backend.exception.VehicleException;
import com.fleetman.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Orchestration des vehicules (Presentation <-> InternalVehicleService + parametres). */
@Service
public class VehicleService {

    private final InternalVehicleService internalVehicleService;
    private final VehicleRepository vehicleRepository;
    private final FinancialParameterRepository financialRepository;
    private final MaintenanceParameterRepository maintenanceRepository;
    private final OperationalParameterRepository operationalRepository;

    public VehicleService(InternalVehicleService internalVehicleService,
                          VehicleRepository vehicleRepository,
                          FinancialParameterRepository financialRepository,
                          MaintenanceParameterRepository maintenanceRepository,
                          OperationalParameterRepository operationalRepository) {
        this.internalVehicleService = internalVehicleService;
        this.vehicleRepository = vehicleRepository;
        this.financialRepository = financialRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.operationalRepository = operationalRepository;
    }

    @Transactional
    public VehicleEntity createIndependentVehicle(VehicleRequest req, UUID managerId) {
        return internalVehicleService.createVehicle(req, managerId);
    }

    public List<VehicleEntity> getVehicles(UUID managerId, boolean isAdmin, UUID orgId) {
        return internalVehicleService.getVehicles(managerId, isAdmin, orgId);
    }

    public VehicleDetailResponse getVehicleDetails(UUID vehicleId, UUID managerId, boolean isAdmin, UUID orgId) {
        return internalVehicleService.getVehicleDetails(vehicleId, managerId, isAdmin, orgId);
    }

    @Transactional
    public VehicleEntity patchVehicle(UUID vehicleId, Map<String, Object> updates, UUID managerId, boolean isAdmin, UUID orgId) {
        return internalVehicleService.patchVehicle(vehicleId, updates, managerId, isAdmin, orgId);
    }

    @Transactional
    public void deleteVehicle(UUID vehicleId, UUID managerId, boolean isAdmin, UUID orgId) {
        internalVehicleService.deleteVehicle(vehicleId, managerId, isAdmin, orgId);
    }

    @Transactional
    public VehicleDetailResponse updateFinancialParameters(UUID vehicleId, FinancialParameterEntity req, UUID managerId, boolean isAdmin, UUID orgId) {
        internalVehicleService.getActive(vehicleId, managerId, isAdmin, orgId);
        FinancialParameterEntity fp = financialRepository.findByVehicleId(vehicleId)
                .orElseGet(() -> FinancialParameterEntity.builder().vehicleId(vehicleId).build());
        if (req.getInsuranceNumber() != null) fp.setInsuranceNumber(req.getInsuranceNumber());
        if (req.getInsuranceExpiredAt() != null) fp.setInsuranceExpiredAt(req.getInsuranceExpiredAt());
        if (req.getRegisteredAt() != null) fp.setRegisteredAt(req.getRegisteredAt());
        if (req.getPurchasedAt() != null) fp.setPurchasedAt(req.getPurchasedAt());
        if (req.getDepreciationRate() != null) fp.setDepreciationRate(req.getDepreciationRate());
        if (req.getCostPerKm() != null) fp.setCostPerKm(req.getCostPerKm());
        financialRepository.save(fp);
        return getVehicleDetails(vehicleId, managerId, isAdmin, orgId);
    }

    @Transactional
    public VehicleDetailResponse updateMaintenanceParameters(UUID vehicleId, MaintenanceParameterEntity req, UUID managerId, boolean isAdmin, UUID orgId) {
        internalVehicleService.getActive(vehicleId, managerId, isAdmin, orgId);
        MaintenanceParameterEntity mp = maintenanceRepository.findByVehicleId(vehicleId)
                .orElseGet(() -> MaintenanceParameterEntity.builder().vehicleId(vehicleId).build());
        if (req.getLastMaintenanceAt() != null) mp.setLastMaintenanceAt(req.getLastMaintenanceAt());
        if (req.getNextMaintenanceAt() != null) mp.setNextMaintenanceAt(req.getNextMaintenanceAt());
        if (req.getEngineStatus() != null) mp.setEngineStatus(req.getEngineStatus());
        if (req.getBatteryHealth() != null) mp.setBatteryHealth(req.getBatteryHealth());
        if (req.getMaintenanceStatus() != null) mp.setMaintenanceStatus(req.getMaintenanceStatus());
        maintenanceRepository.save(mp);
        return getVehicleDetails(vehicleId, managerId, isAdmin, orgId);
    }

    public OperationalParameterEntity getOperational(UUID vehicleId, UUID managerId, boolean isAdmin, UUID orgId) {
        internalVehicleService.getActive(vehicleId, managerId, isAdmin, orgId);
        return operationalRepository.findByVehicleId(vehicleId)
                .orElseThrow(() -> VehicleException.notFound(vehicleId));
    }

    @Transactional
    public void patchOperational(UUID vehicleId, Map<String, Object> updates, UUID managerId, boolean isAdmin, UUID orgId) {
        internalVehicleService.getActive(vehicleId, managerId, isAdmin, orgId);
        OperationalParameterEntity op = operationalRepository.findByVehicleId(vehicleId)
                .orElseGet(() -> OperationalParameterEntity.builder().vehicleId(vehicleId).build());
        updates.forEach((k, val) -> {
            switch (k) {
                case "currentSpeed" -> op.setCurrentSpeed(num(val));
                case "fuelLevel" -> op.setFuelLevel(val == null ? null : val.toString());
                case "mileage" -> op.setMileage(num(val));
                case "odometerReading" -> op.setOdometerReading(num(val));
                case "bearing" -> op.setBearing(num(val));
                case "latitude" -> op.setLatitude(num(val));
                case "longitude" -> op.setLongitude(num(val));
                default -> { }
            }
        });
        operationalRepository.save(op);
    }

    private BigDecimal num(Object val) {
        return val == null ? null : new BigDecimal(val.toString());
    }
}

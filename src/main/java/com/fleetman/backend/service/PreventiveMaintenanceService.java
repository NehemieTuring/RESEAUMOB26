package com.fleetman.backend.service;

import com.fleetman.backend.entity.MaintenanceAlertEntity;
import com.fleetman.backend.entity.MaintenancePlanEntity;
import com.fleetman.backend.exception.PreventiveMaintenanceException;
import com.fleetman.backend.repository.MaintenanceAlertRepository;
import com.fleetman.backend.repository.MaintenancePlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class PreventiveMaintenanceService {

    private final MaintenancePlanRepository planRepository;
    private final MaintenanceAlertRepository alertRepository;

    public PreventiveMaintenanceService(MaintenancePlanRepository planRepository,
                                        MaintenanceAlertRepository alertRepository) {
        this.planRepository = planRepository;
        this.alertRepository = alertRepository;
    }

    // ----- Plans -----

    @Transactional
    public MaintenancePlanEntity createPlan(MaintenancePlanEntity plan) {
        return planRepository.save(plan);
    }

    public List<MaintenancePlanEntity> plansByFleet(UUID fleetId) {
        return fleetId != null ? planRepository.findByFleetId(fleetId) : planRepository.findAll();
    }

    public MaintenancePlanEntity getPlan(UUID id) {
        return planRepository.findById(id).orElseThrow(() -> PreventiveMaintenanceException.notFound(id));
    }

    @Transactional
    public MaintenancePlanEntity updatePlan(UUID id, MaintenancePlanEntity req) {
        MaintenancePlanEntity p = getPlan(id);
        if (req.getLabel() != null) p.setLabel(req.getLabel());
        if (req.getDescription() != null) p.setDescription(req.getDescription());
        if (req.getIntervalKm() != null) p.setIntervalKm(req.getIntervalKm());
        if (req.getIntervalDays() != null) p.setIntervalDays(req.getIntervalDays());
        p.setActive(req.isActive());
        return planRepository.save(p);
    }

    @Transactional
    public void deletePlan(UUID id) {
        planRepository.deleteById(id);
    }

    // ----- Alerts -----

    public List<MaintenanceAlertEntity> alertsByFleet(UUID fleetId) {
        return fleetId != null ? alertRepository.findByFleetId(fleetId) : alertRepository.findAll();
    }

    public MaintenanceAlertEntity getAlert(UUID id) {
        return alertRepository.findById(id).orElseThrow(() -> PreventiveMaintenanceException.notFound(id));
    }

    @Transactional
    public MaintenanceAlertEntity saveAlert(MaintenanceAlertEntity alert) {
        return alertRepository.save(alert);
    }
}

package com.fleetman.backend.service;

import com.fleetman.backend.entity.FleetManagerEntity;
import com.fleetman.backend.exception.ManagerException;
import com.fleetman.backend.repository.FleetManagerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class FleetManagerService {

    private final FleetManagerRepository fleetManagerRepository;

    public FleetManagerService(FleetManagerRepository fleetManagerRepository) {
        this.fleetManagerRepository = fleetManagerRepository;
    }

    public List<FleetManagerEntity> list() {
        return fleetManagerRepository.findAll();
    }

    public FleetManagerEntity get(UUID userId) {
        return fleetManagerRepository.findById(userId)
                .orElseThrow(() -> ManagerException.notFound(userId));
    }

    @Transactional
    public FleetManagerEntity updateCompany(UUID userId, FleetManagerEntity req) {
        FleetManagerEntity mgr = fleetManagerRepository.findById(userId)
                .orElseGet(() -> FleetManagerEntity.builder().userId(userId).build());
        if (req.getCompanyName() != null) mgr.setCompanyName(req.getCompanyName());
        if (req.getCompanyPhone() != null) mgr.setCompanyPhone(req.getCompanyPhone());
        if (req.getCompanyAddress() != null) mgr.setCompanyAddress(req.getCompanyAddress());
        if (req.getCompanyCity() != null) mgr.setCompanyCity(req.getCompanyCity());
        if (req.getCompanyLogoUrl() != null) mgr.setCompanyLogoUrl(req.getCompanyLogoUrl());
        return fleetManagerRepository.save(mgr);
    }
}

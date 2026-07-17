package com.fleetman.backend.service;

import com.fleetman.backend.entity.SubscriptionPlanEntity;
import com.fleetman.backend.exception.OperationException;
import com.fleetman.backend.repository.SubscriptionPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SubscriptionPlanService {

    private final SubscriptionPlanRepository repository;

    public SubscriptionPlanService(SubscriptionPlanRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public SubscriptionPlanEntity create(SubscriptionPlanEntity plan) {
        return repository.save(plan);
    }

    public List<SubscriptionPlanEntity> list(boolean activeOnly) {
        return activeOnly ? repository.findByIsActiveTrue() : repository.findAll();
    }

    public SubscriptionPlanEntity get(UUID id) {
        return repository.findById(id).orElseThrow(() -> OperationException.notFound(id));
    }

    @Transactional
    public SubscriptionPlanEntity update(UUID id, SubscriptionPlanEntity req) {
        SubscriptionPlanEntity p = get(id);
        if (req.getName() != null) p.setName(req.getName());
        if (req.getDescription() != null) p.setDescription(req.getDescription());
        if (req.getPrice() != null) p.setPrice(req.getPrice());
        if (req.getMaxVehicles() != null) p.setMaxVehicles(req.getMaxVehicles());
        if (req.getMaxDrivers() != null) p.setMaxDrivers(req.getMaxDrivers());
        p.setActive(req.isActive());
        return repository.save(p);
    }

    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
    }
}

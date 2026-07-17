package com.fleetman.backend.service;

import com.fleetman.backend.entity.AlertEventEntity;
import com.fleetman.backend.entity.AlertRuleEntity;
import com.fleetman.backend.exception.AlertException;
import com.fleetman.backend.repository.AlertEventRepository;
import com.fleetman.backend.repository.AlertRuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AlertRuleEngineService {

    private final AlertRuleRepository ruleRepository;
    private final AlertEventRepository eventRepository;

    public AlertRuleEngineService(AlertRuleRepository ruleRepository, AlertEventRepository eventRepository) {
        this.ruleRepository = ruleRepository;
        this.eventRepository = eventRepository;
    }

    // ----- Regles -----

    @Transactional
    public AlertRuleEntity createRule(AlertRuleEntity rule) {
        return ruleRepository.save(rule);
    }

    public List<AlertRuleEntity> rulesByManager(UUID managerId) {
        return managerId != null ? ruleRepository.findByManagerId(managerId) : ruleRepository.findAll();
    }

    public AlertRuleEntity getRule(UUID id) {
        return ruleRepository.findById(id).orElseThrow(() -> AlertException.notFound(id));
    }

    @Transactional
    public AlertRuleEntity updateRule(UUID id, AlertRuleEntity req) {
        AlertRuleEntity r = getRule(id);
        if (req.getThreshold() != null) r.setThreshold(req.getThreshold());
        if (req.getOperator() != null) r.setOperator(req.getOperator());
        if (req.getSeverity() != null) r.setSeverity(req.getSeverity());
        r.setActive(req.isActive());
        return ruleRepository.save(r);
    }

    @Transactional
    public void deleteRule(UUID id) {
        ruleRepository.deleteById(id);
    }

    // ----- Evenements -----

    public List<AlertEventEntity> eventsByRule(UUID ruleId) {
        return ruleId != null ? eventRepository.findByRuleId(ruleId) : eventRepository.findAll();
    }

    @Transactional
    public AlertEventEntity acknowledge(UUID eventId, UUID userId) {
        AlertEventEntity e = eventRepository.findById(eventId)
                .orElseThrow(() -> AlertException.notFound(eventId));
        e.setAcknowledged(true);
        e.setAcknowledgedAt(Instant.now());
        e.setAcknowledgedBy(userId);
        return eventRepository.save(e);
    }
}

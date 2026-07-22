package com.fleetman.backend.service;

import com.fleetman.backend.entity.ScheduleEntity;
import com.fleetman.backend.exception.PlanningException;
import com.fleetman.backend.repository.ScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    public ScheduleService(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    @Transactional
    public ScheduleEntity create(ScheduleEntity schedule, UUID managerId) {
        if (schedule.getStatus() == null) schedule.setStatus("DRAFT");
        schedule.setManagerId(managerId);
        return scheduleRepository.save(schedule);
    }

    public List<ScheduleEntity> list(UUID fleetId, UUID managerId) {
        List<ScheduleEntity> schedules = managerId != null ? scheduleRepository.findByManagerId(managerId) : scheduleRepository.findAll();
        if (fleetId != null) schedules = schedules.stream().filter(s -> fleetId.equals(s.getFleetId())).toList();
        return schedules;
    }

    public ScheduleEntity get(UUID id, UUID managerId) {
        ScheduleEntity s = scheduleRepository.findById(id).orElseThrow(() -> PlanningException.notFound(id));
        if (managerId != null) com.fleetman.backend.controller.SecurityUtils.requireOwnership(s.getManagerId(), managerId);
        return s;
    }

    @Transactional
    public ScheduleEntity update(UUID id, ScheduleEntity req, UUID managerId) {
        ScheduleEntity s = get(id, managerId);
        if (req.getTitle() != null) s.setTitle(req.getTitle());
        if (req.getStatus() != null) s.setStatus(req.getStatus());
        if (req.getNotes() != null) s.setNotes(req.getNotes());
        if (req.getStartDate() != null) s.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) s.setEndDate(req.getEndDate());
        return scheduleRepository.save(s);
    }

    @Transactional
    public void delete(UUID id, UUID managerId) {
        ScheduleEntity s = get(id, managerId);
        scheduleRepository.delete(s);
    }
}

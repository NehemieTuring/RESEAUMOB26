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
    public ScheduleEntity create(ScheduleEntity schedule) {
        if (schedule.getStatus() == null) schedule.setStatus("DRAFT");
        return scheduleRepository.save(schedule);
    }

    public List<ScheduleEntity> list(UUID fleetId) {
        return fleetId != null ? scheduleRepository.findByFleetId(fleetId) : scheduleRepository.findAll();
    }

    public ScheduleEntity get(UUID id) {
        return scheduleRepository.findById(id).orElseThrow(() -> PlanningException.notFound(id));
    }

    @Transactional
    public ScheduleEntity update(UUID id, ScheduleEntity req) {
        ScheduleEntity s = get(id);
        if (req.getTitle() != null) s.setTitle(req.getTitle());
        if (req.getStatus() != null) s.setStatus(req.getStatus());
        if (req.getNotes() != null) s.setNotes(req.getNotes());
        if (req.getStartDate() != null) s.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) s.setEndDate(req.getEndDate());
        return scheduleRepository.save(s);
    }

    @Transactional
    public void delete(UUID id) {
        scheduleRepository.deleteById(id);
    }
}

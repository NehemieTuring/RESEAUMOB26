package com.fleetman.backend.service;

import com.fleetman.backend.entity.AssignmentEntity;
import com.fleetman.backend.exception.PlanningException;
import com.fleetman.backend.repository.AssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;

    public AssignmentService(AssignmentRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }

    @Transactional
    public AssignmentEntity create(AssignmentEntity assignment) {
        if (assignment.getStatus() == null) assignment.setStatus("PLANNED");
        return assignmentRepository.save(assignment);
    }

    public List<AssignmentEntity> list(UUID scheduleId, UUID fleetId) {
        if (scheduleId != null) return assignmentRepository.findByScheduleId(scheduleId);
        if (fleetId != null) return assignmentRepository.findByFleetId(fleetId);
        return assignmentRepository.findAll();
    }

    public AssignmentEntity get(UUID id) {
        return assignmentRepository.findById(id).orElseThrow(() -> PlanningException.notFound(id));
    }

    @Transactional
    public AssignmentEntity update(UUID id, AssignmentEntity req) {
        AssignmentEntity a = get(id);
        if (req.getStatus() != null) a.setStatus(req.getStatus());
        if (req.getStartDatetime() != null) a.setStartDatetime(req.getStartDatetime());
        if (req.getEndDatetime() != null) a.setEndDatetime(req.getEndDatetime());
        if (req.getNotes() != null) a.setNotes(req.getNotes());
        return assignmentRepository.save(a);
    }

    @Transactional
    public void delete(UUID id) {
        assignmentRepository.deleteById(id);
    }
}

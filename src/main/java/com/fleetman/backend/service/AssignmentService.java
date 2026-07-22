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
    public AssignmentEntity create(AssignmentEntity assignment, UUID managerId) {
        if (assignment.getStatus() == null) assignment.setStatus("PLANNED");
        assignment.setManagerId(managerId);
        return assignmentRepository.save(assignment);
    }

    public List<AssignmentEntity> list(UUID scheduleId, UUID fleetId, UUID managerId) {
        List<AssignmentEntity> assignments = managerId != null ? assignmentRepository.findByManagerId(managerId) : assignmentRepository.findAll();
        if (scheduleId != null) assignments = assignments.stream().filter(a -> scheduleId.equals(a.getScheduleId())).toList();
        if (fleetId != null) assignments = assignments.stream().filter(a -> fleetId.equals(a.getFleetId())).toList();
        return assignments;
    }

    public AssignmentEntity get(UUID id, UUID managerId) {
        AssignmentEntity a = assignmentRepository.findById(id).orElseThrow(() -> PlanningException.notFound(id));
        if (managerId != null) com.fleetman.backend.controller.SecurityUtils.requireOwnership(a.getManagerId(), managerId);
        return a;
    }

    @Transactional
    public AssignmentEntity update(UUID id, AssignmentEntity req, UUID managerId) {
        AssignmentEntity a = get(id, managerId);
        if (req.getStatus() != null) a.setStatus(req.getStatus());
        if (req.getStartDatetime() != null) a.setStartDatetime(req.getStartDatetime());
        if (req.getEndDatetime() != null) a.setEndDatetime(req.getEndDatetime());
        if (req.getNotes() != null) a.setNotes(req.getNotes());
        return assignmentRepository.save(a);
    }

    @Transactional
    public void delete(UUID id, UUID managerId) {
        AssignmentEntity a = get(id, managerId);
        assignmentRepository.delete(a);
    }
}

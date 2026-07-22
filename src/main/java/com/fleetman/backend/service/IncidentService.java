package com.fleetman.backend.service;

import com.fleetman.backend.entity.ExpenseEntity;
import com.fleetman.backend.entity.IncidentEntity;
import com.fleetman.backend.entity.VehicleEntity;
import com.fleetman.backend.exception.OperationException;
import com.fleetman.backend.repository.ExpenseRepository;
import com.fleetman.backend.repository.IncidentRepository;
import com.fleetman.backend.repository.UserRepository;
import com.fleetman.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final ExpenseRepository expenseRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final InternalNotificationService notificationService;

    public IncidentService(IncidentRepository incidentRepository,
                           ExpenseRepository expenseRepository,
                           VehicleRepository vehicleRepository,
                           UserRepository userRepository,
                           InternalNotificationService notificationService) {
        this.incidentRepository = incidentRepository;
        this.expenseRepository = expenseRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public IncidentEntity create(IncidentEntity incident, UUID managerId) {
        if (incident.getIncidentDateTime() == null) incident.setIncidentDateTime(Instant.now());
        if (incident.getStatus() == null) incident.setStatus("OPEN");
        incident.setManagerId(managerId);
        IncidentEntity saved = incidentRepository.save(incident);

        VehicleEntity vehicle = incident.getVehicleId() != null
                ? vehicleRepository.findById(incident.getVehicleId()).orElse(null) : null;

        // Notification prioritaire si gravite elevee
        if (vehicle != null && vehicle.getManagerId() != null) {
            String severity = incident.getSeverity();
            boolean high = "HIGH".equalsIgnoreCase(severity) || "CRITICAL".equalsIgnoreCase(severity);
            notificationService.sendNotification(vehicle.getManagerId(),
                    high ? "Incident prioritaire" : "Nouvel incident",
                    "Incident (" + incident.getType() + ") sur " + incident.getVehicleRegistration(),
                    high ? "INCIDENT_HIGH" : "INCIDENT");
        }

        // Depense de type INCIDENT si cout renseigne
        if (incident.getCost() != null) {
            expenseRepository.save(ExpenseEntity.builder()
                    .expenseType("INCIDENT")
                    .amount(incident.getCost())
                    .description("Incident : " + incident.getType())
                    .status("APPROVED")
                    .sourceType("INCIDENT")
                    .vehicleId(incident.getVehicleId())
                    .vehicleRegistration(incident.getVehicleRegistration())
                    .fleetId(vehicle != null ? vehicle.getFleetId() : null)
                    .managerId(vehicle != null ? vehicle.getManagerId() : null)
                    .driverId(incident.getDriverId())
                    .driverFullName(incident.getDriverFullName())
                    .build());
        }
        return saved;
    }

    public List<IncidentEntity> list(UUID vehicleId, UUID userId, boolean isAdmin, UUID orgId) {
        List<IncidentEntity> list = isAdmin ? incidentRepository.findAllByOrganizationIdAndDeletedFalse(orgId)
                : (userId != null ? incidentRepository.findAllByManagerIdAndDeletedFalse(userId) : incidentRepository.findByDeletedFalse());
        if (vehicleId != null) {
            return list.stream().filter(i -> vehicleId.equals(i.getVehicleId())).toList();
        }
        return list;
    }

    public IncidentEntity get(UUID id, UUID userId, boolean isAdmin, UUID orgId) {
        IncidentEntity i = incidentRepository.findById(id).orElseThrow(() -> OperationException.notFound(id));
        if (userId != null) {
            if (userId.equals(i.getManagerId())) return i;
            if (isAdmin && orgId != null) {
                boolean sameOrg = userRepository.findById(i.getManagerId())
                        .map(u -> orgId.equals(u.getOrganizationId())).orElse(false);
                if (sameOrg) return i;
            }
            throw new org.springframework.security.access.AccessDeniedException("Vous n'avez pas acces a cet incident.");
        }
        return i;
    }

    @Transactional
    public IncidentEntity update(UUID id, IncidentEntity req, UUID managerId, boolean isAdmin, UUID orgId) {
        IncidentEntity i = get(id, managerId, isAdmin, orgId);
        if (req.getDescription() != null) i.setDescription(req.getDescription());
        if (req.getSeverity() != null) i.setSeverity(req.getSeverity());
        if (req.getStatus() != null) i.setStatus(req.getStatus());
        if (req.getCost() != null) i.setCost(req.getCost());
        return incidentRepository.save(i);
    }

    @Transactional
    public void delete(UUID id, UUID managerId, boolean isAdmin, UUID orgId) {
        IncidentEntity i = get(id, managerId, isAdmin, orgId);
        i.setDeleted(true);
        i.setDeletedAt(Instant.now());
        incidentRepository.save(i);
    }
}

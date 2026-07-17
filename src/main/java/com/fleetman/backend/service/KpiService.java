package com.fleetman.backend.service;

import com.fleetman.backend.entity.KpiSnapshotEntity;
import com.fleetman.backend.exception.OperationException;
import com.fleetman.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class KpiService {

    private final KpiSnapshotRepository kpiRepository;
    private final TripRepository tripRepository;
    private final IncidentRepository incidentRepository;

    public KpiService(KpiSnapshotRepository kpiRepository, TripRepository tripRepository,
                      IncidentRepository incidentRepository) {
        this.kpiRepository = kpiRepository;
        this.tripRepository = tripRepository;
        this.incidentRepository = incidentRepository;
    }

    public List<KpiSnapshotEntity> listByFleet(UUID fleetId) {
        return kpiRepository.findByFleetId(fleetId);
    }

    public KpiSnapshotEntity get(UUID id) {
        return kpiRepository.findById(id).orElseThrow(() -> OperationException.notFound(id));
    }

    @Transactional
    public KpiSnapshotEntity save(KpiSnapshotEntity snapshot) {
        return kpiRepository.save(snapshot);
    }

    /** Calcul en direct des KPI d'un vehicule (agregation simple). */
    public KpiSnapshotEntity computeForVehicle(UUID vehicleId, UUID fleetId) {
        var trips = tripRepository.findByVehicleId(vehicleId);
        BigDecimal totalKm = trips.stream()
                .map(t -> t.getComputedDistanceKm() != null ? t.getComputedDistanceKm() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int incidents = incidentRepository.findByVehicleIdAndDeletedFalse(vehicleId).size();
        return KpiSnapshotEntity.builder()
                .fleetId(fleetId).entityType("VEHICLE").entityId(vehicleId)
                .totalKm(totalKm).totalTrips(trips.size()).totalIncidents(incidents)
                .build();
    }
}

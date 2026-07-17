package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.*;

@Repository
public interface KpiSnapshotRepository extends JpaRepository<KpiSnapshotEntity, UUID> {
    List<KpiSnapshotEntity> findByFleetId(UUID fleetId);
    List<KpiSnapshotEntity> findByEntityTypeAndEntityId(String entityType, UUID entityId);
    Optional<KpiSnapshotEntity> findByEntityTypeAndEntityIdAndPeriodTypeAndPeriodStart(String entityType, UUID entityId, String periodType, LocalDate periodStart);
}

package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.*;

@Repository
public interface AlertEventRepository extends JpaRepository<AlertEventEntity, UUID> {
    List<AlertEventEntity> findByRuleId(UUID ruleId);
    List<AlertEventEntity> findByEntityTypeAndEntityId(String entityType, UUID entityId);
}

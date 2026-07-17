package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.*;

@Repository
public interface AlertRuleRepository extends JpaRepository<AlertRuleEntity, UUID> {
    List<AlertRuleEntity> findByManagerId(UUID managerId);
    List<AlertRuleEntity> findByFleetId(UUID fleetId);
    List<AlertRuleEntity> findByActiveTrue();
}

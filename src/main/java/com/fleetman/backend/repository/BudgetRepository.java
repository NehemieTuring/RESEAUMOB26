package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.*;

@Repository
public interface BudgetRepository extends JpaRepository<BudgetEntity, UUID> {
    List<BudgetEntity> findByManagerId(UUID managerId);
    Optional<BudgetEntity> findByScopeAndEntityIdAndBudgetMonth(String scope, UUID entityId, LocalDate budgetMonth);
}

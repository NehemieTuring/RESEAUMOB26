package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.*;

@Repository
public interface ExpenseRepository extends JpaRepository<ExpenseEntity, UUID> {
    List<ExpenseEntity> findByFleetIdAndDeletedFalse(UUID fleetId);
    List<ExpenseEntity> findByVehicleIdAndDeletedFalse(UUID vehicleId);
    List<ExpenseEntity> findByManagerIdAndDeletedFalse(UUID managerId);
    List<ExpenseEntity> findByDeletedFalse();
}

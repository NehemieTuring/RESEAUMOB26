package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.*;

@Repository
public interface ScheduleRepository extends JpaRepository<ScheduleEntity, UUID> {
    List<ScheduleEntity> findByFleetId(UUID fleetId);
    List<ScheduleEntity> findByManagerId(UUID managerId);
}

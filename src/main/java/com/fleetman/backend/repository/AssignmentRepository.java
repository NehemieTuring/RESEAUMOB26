package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.*;

@Repository
public interface AssignmentRepository extends JpaRepository<AssignmentEntity, UUID> {
    List<AssignmentEntity> findByScheduleId(UUID scheduleId);
    List<AssignmentEntity> findByFleetId(UUID fleetId);
    List<AssignmentEntity> findByVehicleId(UUID vehicleId);
    List<AssignmentEntity> findByDriverId(UUID driverId);
}

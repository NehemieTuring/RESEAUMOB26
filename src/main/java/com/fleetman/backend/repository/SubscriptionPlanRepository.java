package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.*;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlanEntity, UUID> {
    List<SubscriptionPlanEntity> findByIsActiveTrue();
}

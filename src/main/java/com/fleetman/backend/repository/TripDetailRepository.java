package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface TripDetailRepository extends JpaRepository<TripDetailEntity, UUID> {
    List<TripDetailEntity> findByTripId(UUID tripId);
}

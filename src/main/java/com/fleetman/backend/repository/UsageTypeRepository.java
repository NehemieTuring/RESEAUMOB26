package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface UsageTypeRepository extends JpaRepository<UsageTypeEntity, UUID> {
    Optional<UsageTypeEntity> findByCode(String code);
}

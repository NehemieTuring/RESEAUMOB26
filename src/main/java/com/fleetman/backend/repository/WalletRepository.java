package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.*;

@Repository
public interface WalletRepository extends JpaRepository<WalletEntity, UUID> {
    Optional<WalletEntity> findByOwnerId(UUID ownerId);
    boolean existsByOwnerId(UUID ownerId);
}

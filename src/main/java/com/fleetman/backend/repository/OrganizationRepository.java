package com.fleetman.backend.repository;

import com.fleetman.backend.entity.OrganizationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<OrganizationEntity, UUID> {
    boolean existsByName(String name);
    boolean existsByUin(String uin);
    boolean existsByTaxId(String taxId);
}

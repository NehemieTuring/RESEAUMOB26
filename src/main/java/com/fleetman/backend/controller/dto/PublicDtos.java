package com.fleetman.backend.controller.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** DTOs du parcours public (consultation des plans + inscription gestionnaire). */
public final class PublicDtos {

    private PublicDtos() {}

    public record PublicSubscriptionPlan(
            UUID id,
            String name,
            String description,
            Integer maxFleets,
            Integer maxVehicles,
            Integer maxDrivers,
            BigDecimal monthlyPrice,
            BigDecimal annualPrice,
            String currency,
            String features,
            boolean isActive
    ) {}

    public record RegisterManagerDocument(
            String docType,
            String docNumber,
            String fileUrl,
            String fileMimeType,
            String fileOriginalName,
            String issuer,
            String issueDate,
            String expiryDate,
            String notes
    ) {}

    public record RegisterManagerRequest(
            String username,
            String password,
            String email,
            String phone,
            String firstName,
            String lastName,
            String companyName,
            UUID requestedPlanId,
            List<RegisterManagerDocument> documents
    ) {}

    public record RegisterManagerResponse(UUID id, String status, String message) {}
}

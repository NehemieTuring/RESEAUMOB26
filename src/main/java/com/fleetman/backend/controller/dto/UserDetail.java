package com.fleetman.backend.controller.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Representation enrichie d'un utilisateur, retournee par l'API d'authentification.
 * Le format JSON doit rester identique a l'ancien AuthPort.UserDetail :
 * chaque champ est present meme s'il est null.
 */
public record UserDetail(
        UUID id,
        String username,
        String email,
        String phone,
        String firstName,
        String lastName,
        String service,
        List<String> roles,
        List<String> permissions,
        String photoUrl,
        String companyName,
        String licenceNumber,
        String vehicleId,
        boolean isActive,
        Instant lastLoginAt,
        String companyPhone,
        String companyAddress,
        String companyCity,
        String companyLogoUrl
) {}

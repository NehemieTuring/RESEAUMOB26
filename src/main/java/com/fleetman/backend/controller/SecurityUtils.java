package com.fleetman.backend.controller;

import com.fleetman.backend.controller.dto.UserDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;

import java.util.UUID;

/** Helpers d'extraction de l'utilisateur authentifie (principal = UserDetail). */
public final class SecurityUtils {

    private SecurityUtils() {}

    public static UserDetail currentUser(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof UserDetail user)) {
            return null;
        }
        return user;
    }

    public static UUID getUserId(Authentication auth) {
        UserDetail user = currentUser(auth);
        return user != null ? user.id() : null;
    }

    public static boolean isAdmin(Authentication auth) {
        UserDetail user = currentUser(auth);
        return user != null && user.roles().stream()
                .anyMatch(r -> r.equals("FLEET_ADMIN") || r.equals("FLEET_SUPER_ADMIN"));
    }

    public static boolean isDriver(Authentication auth) {
        UserDetail user = currentUser(auth);
        return user != null && user.roles().stream()
                .anyMatch(r -> r.equals("FLEET_DRIVER"));
    }

    public static UUID getOrganizationId(Authentication auth) {
        UserDetail user = currentUser(auth);
        return user != null ? user.organizationId() : null;
    }

    /**
     * Verifie que l'entite appartient bien au manager authentifie.
     * Lance AccessDeniedException si non autorise.
     */
    public static void requireOwnership(UUID entityManagerId, UUID currentUserId) {
        if (entityManagerId == null || !entityManagerId.equals(currentUserId)) {
            throw new AccessDeniedException("Vous n'avez pas acces a cette ressource.");
        }
    }

    /**
     * Verifie que deux entites partagent la meme organisation.
     * Lance AccessDeniedException si non autorise.
     */
    public static void requireSameOrganization(UUID entityOrgId, UUID currentOrgId) {
        if (entityOrgId == null || !entityOrgId.equals(currentOrgId)) {
            throw new AccessDeniedException("Cette ressource n'appartient pas a votre organisation.");
        }
    }
}

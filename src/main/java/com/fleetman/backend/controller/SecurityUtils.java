package com.fleetman.backend.controller;

import com.fleetman.backend.controller.dto.UserDetail;
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
}

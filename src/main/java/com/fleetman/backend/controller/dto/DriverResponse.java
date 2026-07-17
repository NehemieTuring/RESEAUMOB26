package com.fleetman.backend.controller.dto;

import java.time.Instant;
import java.util.UUID;

public record DriverResponse(UUID userId, UUID fleetId, String licenceNumber, String status,
                             UUID assignedVehicleId, String photoUrl, String username, String email,
                             String firstName, String lastName, String phone, boolean isActive,
                             Instant lastLoginAt) {}

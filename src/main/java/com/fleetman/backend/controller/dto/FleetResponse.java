package com.fleetman.backend.controller.dto;

import java.time.Instant;
import java.util.UUID;

public record FleetResponse(UUID id, UUID managerId, String name, String phoneNumber,
                            Instant createdAt, Integer vehicleCount) {}

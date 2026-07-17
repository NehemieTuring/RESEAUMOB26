package com.fleetman.backend.controller.dto;

import java.math.BigDecimal;
import java.util.Map;

public record FleetStatsResponse(BigDecimal totalKm, Map<String, Long> vehiclesByStatus, long driverCount) {}

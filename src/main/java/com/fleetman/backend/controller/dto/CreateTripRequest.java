package com.fleetman.backend.controller.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record CreateTripRequest(UUID vehicleId, UUID driverId, UUID fleetId, LocalDate startDate,
                                LocalTime startTime, String departureLocation, String missionObject,
                                BigDecimal missionCost, String rateType, List<TripDetailRequest> details) {
    public record TripDetailRequest(String itemType, String description, Integer quantity,
                                    BigDecimal weight) {}
}

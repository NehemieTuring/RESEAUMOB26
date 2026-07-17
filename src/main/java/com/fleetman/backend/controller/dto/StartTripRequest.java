package com.fleetman.backend.controller.dto;

import java.math.BigDecimal;

public record StartTripRequest(BigDecimal departureKmIndex, BigDecimal departureFuelIndex,
                               String departureLocation) {}

package com.fleetman.backend.controller.dto;

import java.math.BigDecimal;

public record CompleteTripRequest(BigDecimal returnKmIndex, BigDecimal returnFuelIndex,
                                  String returnLocation) {}

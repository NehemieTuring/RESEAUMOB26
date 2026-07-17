package com.fleetman.backend.controller.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record RegisterReturnRequest(UUID tripId, BigDecimal returnKmIndex, BigDecimal returnFuelIndex,
                                    String returnLocation) {}

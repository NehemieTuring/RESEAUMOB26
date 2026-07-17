package com.fleetman.backend.controller.dto;

import java.util.UUID;

public record VehicleRequest(UUID vehicleTypeId, String licensePlate, UUID brandId, UUID modelId,
                             Integer manufacturingYear, UUID fuelTypeId, UUID transmissionTypeId,
                             Double tankCapacity, Integer totalSeatNumber, Double averageFuelConsumption,
                             UUID colorId, UUID sizeId, UUID usageTypeId) {}

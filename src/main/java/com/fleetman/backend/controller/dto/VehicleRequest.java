package com.fleetman.backend.controller.dto;

import java.util.UUID;

public record VehicleRequest(String vehicleType, String licensePlate, String brand, String model,
                             Integer manufacturingYear, String fuelType, String transmissionType,
                             Double tankCapacity, Integer totalSeatNumber, Double averageFuelConsumption,
                             String color, String size, String usageType, UUID fleetId) {}

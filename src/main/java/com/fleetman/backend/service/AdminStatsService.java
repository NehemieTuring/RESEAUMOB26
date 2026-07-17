package com.fleetman.backend.service;

import com.fleetman.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AdminStatsService {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final FleetRepository fleetRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;

    public AdminStatsService(UserRepository userRepository, VehicleRepository vehicleRepository,
                             FleetRepository fleetRepository, DriverRepository driverRepository,
                             TripRepository tripRepository) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.fleetRepository = fleetRepository;
        this.driverRepository = driverRepository;
        this.tripRepository = tripRepository;
    }

    public Map<String, Object> globalStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalVehicles", vehicleRepository.findByDeletedFalse().size());
        stats.put("totalFleets", fleetRepository.count());
        stats.put("totalDrivers", driverRepository.count());
        stats.put("totalTrips", tripRepository.count());
        return stats;
    }
}

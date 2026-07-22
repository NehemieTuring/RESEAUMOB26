package com.fleetman.backend.service;

import com.fleetman.backend.controller.dto.*;
import com.fleetman.backend.entity.*;
import com.fleetman.backend.exception.TripException;
import com.fleetman.backend.exception.VehicleException;
import com.fleetman.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;
import java.util.List;
import java.util.UUID;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final TripDetailRepository tripDetailRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final OperationalParameterRepository operationalRepository;
    private final UserRepository userRepository;

    public TripService(TripRepository tripRepository,
                       TripDetailRepository tripDetailRepository,
                       VehicleRepository vehicleRepository,
                       DriverRepository driverRepository,
                       OperationalParameterRepository operationalRepository,
                       UserRepository userRepository) {
        this.tripRepository = tripRepository;
        this.tripDetailRepository = tripDetailRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.operationalRepository = operationalRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TripEntity createTrip(CreateTripRequest req, UUID createdBy) {
        VehicleEntity vehicle = vehicleRepository.findById(req.vehicleId())
                .orElseThrow(() -> VehicleException.notFound(req.vehicleId()));
        com.fleetman.backend.controller.SecurityUtils.requireOwnership(vehicle.getManagerId(), createdBy);
        if (!"AVAILABLE".equals(vehicle.getStatus())) {
            throw VehicleException.notAvailable();
        }
        DriverEntity driver = driverRepository.findById(req.driverId())
                .orElseThrow(() -> TripException.notFound(req.driverId()));
        if (!"ACTIVE".equals(driver.getStatus())) {
            throw TripException.invalidState("driver ACTIVE", driver.getStatus());
        }

        TripEntity trip = TripEntity.builder()
                .tripCode(generateTripCode())
                .vehicleId(req.vehicleId())
                .driverId(req.driverId())
                .fleetId(req.fleetId())
                .createdBy(createdBy)
                .status("SCHEDULED")
                .startDate(req.startDate())
                .startTime(req.startTime())
                .departureLocation(req.departureLocation())
                .missionObject(req.missionObject())
                .missionCost(req.missionCost())
                .rateType(req.rateType())
                .build();
        trip = tripRepository.save(trip);

        if (req.details() != null) {
            for (var d : req.details()) {
                tripDetailRepository.save(TripDetailEntity.builder()
                        .tripId(trip.getId())
                        .itemType(d.itemType())
                        .description(d.description())
                        .quantity(d.quantity() != null ? d.quantity() : 0)
                        .weight(d.weight())
                        .departureQuantity(d.quantity())
                        .build());
            }
        }

        vehicle.setStatus("ON_TRIP");
        vehicleRepository.save(vehicle);
        return trip;
    }

    private String generateTripCode() {
        int year = Year.now().getValue();
        String prefix = "TRJ-" + year + "-";
        long seq = tripRepository.countByTripCodeStartingWith(prefix) + 1;
        return prefix + String.format("%04d", seq);
    }

    public List<TripEntity> list(UUID fleetId, UUID userId, boolean isAdmin, UUID orgId) {
        if (fleetId != null) {
            return tripRepository.findByFleetId(fleetId).stream()
                    .filter(t -> userId == null || isAdmin || userId.equals(t.getCreatedBy()))
                    .toList();
        }
        return isAdmin ? tripRepository.findAllByOrganizationId(orgId)
                : (userId != null ? tripRepository.findAllByManagerId(userId) : tripRepository.findAll());
    }

    public TripEntity get(UUID id, UUID userId, boolean isDriver, boolean isAdmin, UUID orgId) {
        TripEntity t = tripRepository.findById(id).orElseThrow(() -> TripException.notFound(id));
        if (userId != null) {
            if (isDriver) {
                if (!userId.equals(t.getDriverId())) {
                    throw new org.springframework.security.access.AccessDeniedException("Ce trajet n'est pas le vôtre.");
                }
            } else {
                if (userId.equals(t.getCreatedBy())) return t;
                boolean ownsVehicle = vehicleRepository.findById(t.getVehicleId())
                        .map(v -> userId.equals(v.getManagerId())).orElse(false);
                if (ownsVehicle) return t;

                if (isAdmin && orgId != null) {
                    boolean sameOrg = userRepository.findById(t.getCreatedBy())
                            .map(u -> orgId.equals(u.getOrganizationId())).orElse(false);
                    if (sameOrg) return t;
                }
                throw new org.springframework.security.access.AccessDeniedException("Vous n'avez pas acces a ce trajet.");
            }
        }
        return t;
    }

    public TripEntity getByCode(String code) {
        return tripRepository.findByTripCode(code).orElseThrow(() -> TripException.notFound(code));
    }

    @Transactional
    public TripEntity startTrip(UUID tripId, StartTripRequest req, UUID userId, boolean isDriver, boolean isAdmin, UUID orgId) {
        TripEntity trip = get(tripId, userId, isDriver, isAdmin, orgId);
        requireStatus(trip, "SCHEDULED");
        trip.setStatus("DEPARTED");
        trip.setDepartureKmIndex(req.departureKmIndex());
        trip.setDepartureFuelIndex(req.departureFuelIndex());
        if (req.departureLocation() != null) trip.setDepartureLocation(req.departureLocation());
        return tripRepository.save(trip);
    }

    @Transactional
    public TripEntity returningTrip(UUID tripId, UUID userId, boolean isDriver, boolean isAdmin, UUID orgId) {
        TripEntity trip = get(tripId, userId, isDriver, isAdmin, orgId);
        requireStatus(trip, "DEPARTED");
        trip.setStatus("RETURNING");
        return tripRepository.save(trip);
    }

    @Transactional
    public TripEntity completeTrip(UUID tripId, CompleteTripRequest req, UUID userId, boolean isDriver, boolean isAdmin, UUID orgId) {
        TripEntity trip = get(tripId, userId, isDriver, isAdmin, orgId);
        if (!"DEPARTED".equals(trip.getStatus()) && !"RETURNING".equals(trip.getStatus())) {
            throw TripException.invalidState("DEPARTED|RETURNING", trip.getStatus());
        }
        trip.setStatus("COMPLETED");
        trip.setReturnKmIndex(req.returnKmIndex());
        trip.setReturnFuelIndex(req.returnFuelIndex());
        trip.setReturnLocation(req.returnLocation());
        trip.setReturnRegisteredAt(Instant.now());
        trip.setEndDate(LocalDate.now());
        trip.setEndTime(LocalTime.now());

        if (req.returnKmIndex() != null && trip.getDepartureKmIndex() != null) {
            trip.setComputedDistanceKm(req.returnKmIndex().subtract(trip.getDepartureKmIndex()));
        }
        if (trip.getDepartureFuelIndex() != null && req.returnFuelIndex() != null) {
            trip.setComputedFuelConsumed(trip.getDepartureFuelIndex().subtract(req.returnFuelIndex()));
        }
        if (trip.getStartDate() != null && trip.getStartTime() != null) {
            LocalDateTime start = LocalDateTime.of(trip.getStartDate(), trip.getStartTime());
            trip.setDurationMinutes((int) Duration.between(start, LocalDateTime.now()).toMinutes());
        }
        tripRepository.save(trip);
        releaseVehicle(trip.getVehicleId());
        return trip;
    }

    @Transactional
    public TripEntity registerReturn(RegisterReturnRequest req, UUID userId, boolean isDriver, boolean isAdmin, UUID orgId) {
        return completeTrip(req.tripId(),
                new CompleteTripRequest(req.returnKmIndex(), req.returnFuelIndex(), req.returnLocation()), userId, isDriver, isAdmin, orgId);
    }

    @Transactional
    public TripEntity cancelTrip(UUID tripId, String reason, UUID managerId, boolean isAdmin, UUID orgId) {
        TripEntity trip = get(tripId, managerId, false, isAdmin, orgId);
        if (!"SCHEDULED".equals(trip.getStatus()) && !"DEPARTED".equals(trip.getStatus())) {
            throw TripException.invalidState("SCHEDULED|DEPARTED", trip.getStatus());
        }
        trip.setStatus("CANCELLED");
        trip.setCancelReason(reason);
        trip.setCancelledAt(Instant.now());
        tripRepository.save(trip);
        releaseVehicle(trip.getVehicleId());
        return trip;
    }

    @Transactional
    public TripEntity changeDriver(UUID tripId, UUID newDriverId, UUID managerId, boolean isAdmin, UUID orgId) {
        TripEntity trip = get(tripId, managerId, false, isAdmin, orgId);
        driverRepository.findById(newDriverId).orElseThrow(() -> TripException.notFound(newDriverId));
        trip.setDriverId(newDriverId);
        return tripRepository.save(trip);
    }

    @Transactional
    public void telemetry(UUID tripId, TelemetryRequest req, UUID userId, boolean isDriver, boolean isAdmin, UUID orgId) {
        TripEntity trip = get(tripId, userId, isDriver, isAdmin, orgId);
        operationalRepository.findByVehicleId(trip.getVehicleId()).ifPresent(op -> {
            if (req.lat() != null) op.setLatitude(BigDecimal.valueOf(req.lat()));
            if (req.lng() != null) op.setLongitude(BigDecimal.valueOf(req.lng()));
            if (req.speed() != null) op.setCurrentSpeed(BigDecimal.valueOf(req.speed()));
            op.setTimestamp(Instant.now());
            operationalRepository.save(op);
        });
    }

    public TripEntity myActiveTrip(UUID driverId) {
        return tripRepository.findByDriverId(driverId).stream()
                .filter(t -> List.of("SCHEDULED", "DEPARTED", "RETURNING").contains(t.getStatus()))
                .findFirst()
                .orElseThrow(TripException::noActiveTrip);
    }

    public List<TripEntity> myHistory(UUID driverId) {
        return tripRepository.findByDriverId(driverId);
    }

    private void requireStatus(TripEntity trip, String expected) {
        if (!expected.equals(trip.getStatus())) {
            throw TripException.invalidState(expected, trip.getStatus());
        }
    }

    private void releaseVehicle(UUID vehicleId) {
        vehicleRepository.findById(vehicleId).ifPresent(v -> {
            v.setStatus("AVAILABLE");
            vehicleRepository.save(v);
        });
    }
}

package com.fleetman.backend.controller;

import com.fleetman.backend.controller.dto.*;
import com.fleetman.backend.entity.TripEntity;
import com.fleetman.backend.service.TripService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "11a. Trajets: Gestion Manager")
@RestController
@RequestMapping("/api/v1/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER','FLEET_ADMIN','FLEET_SUPER_ADMIN')")
    public ResponseEntity<TripEntity> create(Authentication auth, @RequestBody CreateTripRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tripService.createTrip(req, SecurityUtils.getUserId(auth)));
    }

    @GetMapping
    public ResponseEntity<List<TripEntity>> list(@RequestParam(required = false) UUID fleetId, Authentication auth) {
        return ResponseEntity.ok(tripService.list(fleetId, SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @GetMapping("/my-active")
    @PreAuthorize("hasRole('FLEET_DRIVER')")
    public ResponseEntity<TripEntity> myActive(Authentication auth) {
        return ResponseEntity.ok(tripService.myActiveTrip(SecurityUtils.getUserId(auth)));
    }

    @GetMapping("/my-history")
    @PreAuthorize("hasRole('FLEET_DRIVER')")
    public ResponseEntity<List<TripEntity>> myHistory(Authentication auth) {
        return ResponseEntity.ok(tripService.myHistory(SecurityUtils.getUserId(auth)));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<TripEntity> byCode(@PathVariable String code, Authentication auth) {
        TripEntity t = tripService.getByCode(code);
        tripService.get(t.getId(), SecurityUtils.getUserId(auth), SecurityUtils.isDriver(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)); // Ownership check
        return ResponseEntity.ok(t);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripEntity> get(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(tripService.get(id, SecurityUtils.getUserId(auth), SecurityUtils.isDriver(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @PostMapping("/return")
    public ResponseEntity<TripEntity> registerReturn(@RequestBody RegisterReturnRequest req, Authentication auth) {
        return ResponseEntity.ok(tripService.registerReturn(req, SecurityUtils.getUserId(auth), SecurityUtils.isDriver(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @PatchMapping("/{id}/driver")
    public ResponseEntity<TripEntity> changeDriver(@PathVariable UUID id,
                                                  @RequestBody ChangeDriverRequest req, Authentication auth) {
        return ResponseEntity.ok(tripService.changeDriver(id, req.newDriverId(), SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<TripEntity> cancelPatch(@PathVariable UUID id,
                                                 @RequestBody CancelTripRequest req, Authentication auth) {
        return ResponseEntity.ok(tripService.cancelTrip(id, req.reason(), SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<TripEntity> cancelPut(@PathVariable UUID id,
                                               @RequestBody CancelTripRequest req, Authentication auth) {
        return ResponseEntity.ok(tripService.cancelTrip(id, req.reason(), SecurityUtils.getUserId(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<TripEntity> start(@PathVariable UUID id, @RequestBody StartTripRequest req, Authentication auth) {
        return ResponseEntity.ok(tripService.startTrip(id, req, SecurityUtils.getUserId(auth), SecurityUtils.isDriver(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @PutMapping("/{id}/returning")
    public ResponseEntity<TripEntity> returning(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(tripService.returningTrip(id, SecurityUtils.getUserId(auth), SecurityUtils.isDriver(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<TripEntity> complete(@PathVariable UUID id,
                                              @RequestBody CompleteTripRequest req, Authentication auth) {
        return ResponseEntity.ok(tripService.completeTrip(id, req, SecurityUtils.getUserId(auth), SecurityUtils.isDriver(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth)));
    }

    @PostMapping("/{id}/telemetry")
    @PreAuthorize("hasRole('FLEET_DRIVER')")
    public ResponseEntity<Void> telemetry(@PathVariable UUID id, @RequestBody TelemetryRequest req, Authentication auth) {
        tripService.telemetry(id, req, SecurityUtils.getUserId(auth), SecurityUtils.isDriver(auth), SecurityUtils.isAdmin(auth), SecurityUtils.getOrganizationId(auth));
        return ResponseEntity.ok().build();
    }
}

package com.fleetman.backend.controller;

import com.fleetman.backend.controller.dto.PublicDtos.PublicSubscriptionPlan;
import com.fleetman.backend.controller.dto.PublicDtos.RegisterManagerRequest;
import com.fleetman.backend.controller.dto.PublicDtos.RegisterManagerResponse;
import com.fleetman.backend.entity.SubscriptionPlanEntity;
import com.fleetman.backend.service.PublicRegistrationService;
import com.fleetman.backend.service.SubscriptionPlanService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** Endpoints publics : consultation des offres et inscription d'un gestionnaire. */
@Tag(name = "00. Public")
@RestController
@RequestMapping("/api/v1/public")
public class PublicController {

    private static final String DEFAULT_CURRENCY = "XAF";

    private final SubscriptionPlanService planService;
    private final PublicRegistrationService registrationService;

    public PublicController(SubscriptionPlanService planService,
                            PublicRegistrationService registrationService) {
        this.planService = planService;
        this.registrationService = registrationService;
    }

    @GetMapping("/subscription-plans")
    public ResponseEntity<List<PublicSubscriptionPlan>> subscriptionPlans() {
        List<PublicSubscriptionPlan> plans = planService.list(true).stream()
                .map(this::toPublicPlan)
                .toList();
        return ResponseEntity.ok(plans);
    }

    @PostMapping("/register-manager")
    public ResponseEntity<RegisterManagerResponse> registerManager(@RequestBody RegisterManagerRequest req) {
        UUID id = registrationService.registerManager(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(new RegisterManagerResponse(
                id,
                "PENDING",
                "Inscription enregistree. Votre compte sera actif apres validation par un administrateur."));
    }

    private PublicSubscriptionPlan toPublicPlan(SubscriptionPlanEntity p) {
        BigDecimal monthly = p.getPrice();
        Integer months = p.getDurationMonths();
        BigDecimal annual = (monthly != null && months != null && months > 0)
                ? monthly.multiply(BigDecimal.valueOf(12L / Math.max(1, months.longValue())))
                : null;
        return new PublicSubscriptionPlan(
                p.getId(),
                p.getName(),
                p.getDescription(),
                null, // maxFleets non gere par le modele actuel
                p.getMaxVehicles(),
                p.getMaxDrivers(),
                monthly,
                annual,
                DEFAULT_CURRENCY,
                p.getFeatures(),
                p.isActive());
    }
}

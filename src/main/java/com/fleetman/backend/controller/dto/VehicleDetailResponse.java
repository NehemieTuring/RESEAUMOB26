package com.fleetman.backend.controller.dto;

import com.fleetman.backend.entity.*;

import java.util.List;

/** Vue agregee d'un vehicule : donnees principales + parametres + galerie. */
public record VehicleDetailResponse(
        VehicleEntity vehicle,
        OperationalParameterEntity operational,
        FinancialParameterEntity financial,
        MaintenanceParameterEntity maintenance,
        List<VehicleIllustrationImageEntity> gallery) {}

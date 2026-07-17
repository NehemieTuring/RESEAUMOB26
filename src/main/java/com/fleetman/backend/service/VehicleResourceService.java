package com.fleetman.backend.service;

import com.fleetman.backend.controller.dto.LookupResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/** Acces aux referentiels vehicules (delegue a InternalVehicleService). */
@Service
public class VehicleResourceService {

    private final InternalVehicleService internalVehicleService;

    public VehicleResourceService(InternalVehicleService internalVehicleService) {
        this.internalVehicleService = internalVehicleService;
    }

    public List<LookupResponse> lookup(String resource) {
        return internalVehicleService.getLocalLookupData(resource);
    }

    public Map<String, List<LookupResponse>> all() {
        return internalVehicleService.getAllResourcesCatalog();
    }
}

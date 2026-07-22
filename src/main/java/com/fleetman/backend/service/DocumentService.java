package com.fleetman.backend.service;

import com.fleetman.backend.entity.DriverDocumentEntity;
import com.fleetman.backend.entity.VehicleDocumentEntity;
import com.fleetman.backend.exception.DocumentException;
import com.fleetman.backend.repository.DriverDocumentRepository;
import com.fleetman.backend.repository.VehicleDocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    private final VehicleDocumentRepository vehicleDocumentRepository;
    private final DriverDocumentRepository driverDocumentRepository;
    private final VehicleService vehicleService;
    private final DriverService driverService;

    public DocumentService(VehicleDocumentRepository vehicleDocumentRepository,
                           DriverDocumentRepository driverDocumentRepository,
                           VehicleService vehicleService,
                           DriverService driverService) {
        this.vehicleDocumentRepository = vehicleDocumentRepository;
        this.driverDocumentRepository = driverDocumentRepository;
        this.vehicleService = vehicleService;
        this.driverService = driverService;
    }

    // ----- Documents vehicule -----

    @Transactional
    public VehicleDocumentEntity createVehicleDocument(VehicleDocumentEntity doc, UUID managerId, boolean isAdmin, UUID orgId) {
        if (managerId != null && doc.getVehicleId() != null) {
            vehicleService.getVehicleDetails(doc.getVehicleId(), managerId, isAdmin, orgId);
        }
        return vehicleDocumentRepository.save(doc);
    }

    public List<VehicleDocumentEntity> vehicleDocuments(UUID vehicleId, UUID managerId, boolean isAdmin, UUID orgId) {
        if (managerId != null && vehicleId != null) {
            vehicleService.getVehicleDetails(vehicleId, managerId, isAdmin, orgId);
        }
        return vehicleId != null
                ? vehicleDocumentRepository.findByVehicleIdAndDeletedFalse(vehicleId)
                : (managerId != null ? List.of() : vehicleDocumentRepository.findByDeletedFalse());
    }

    @Transactional
    public void deleteVehicleDocument(UUID id, UUID managerId, boolean isAdmin, UUID orgId) {
        VehicleDocumentEntity d = vehicleDocumentRepository.findById(id)
                .orElseThrow(() -> DocumentException.notFound(id));
        if (managerId != null && d.getVehicleId() != null) {
            vehicleService.getVehicleDetails(d.getVehicleId(), managerId, isAdmin, orgId);
        }
        d.setDeleted(true);
        vehicleDocumentRepository.save(d);
    }

    // ----- Documents chauffeur -----

    @Transactional
    public DriverDocumentEntity createDriverDocument(DriverDocumentEntity doc, UUID managerId, boolean isAdmin, UUID orgId) {
        if (managerId != null && doc.getDriverId() != null) {
            driverService.get(doc.getDriverId(), managerId, isAdmin, orgId);
        }
        return driverDocumentRepository.save(doc);
    }

    public List<DriverDocumentEntity> driverDocuments(UUID driverId, UUID managerId, boolean isAdmin, UUID orgId) {
        if (managerId != null && driverId != null) {
            driverService.get(driverId, managerId, isAdmin, orgId);
        }
        return driverId != null
                ? driverDocumentRepository.findByDriverIdAndDeletedFalse(driverId)
                : (managerId != null ? List.of() : driverDocumentRepository.findByDeletedFalse());
    }

    @Transactional
    public void deleteDriverDocument(UUID id, UUID managerId, boolean isAdmin, UUID orgId) {
        DriverDocumentEntity d = driverDocumentRepository.findById(id)
                .orElseThrow(() -> DocumentException.notFound(id));
        if (managerId != null && d.getDriverId() != null) {
            driverService.get(d.getDriverId(), managerId, isAdmin, orgId);
        }
        d.setDeleted(true);
        driverDocumentRepository.save(d);
    }
}

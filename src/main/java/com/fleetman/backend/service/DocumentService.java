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

    public DocumentService(VehicleDocumentRepository vehicleDocumentRepository,
                           DriverDocumentRepository driverDocumentRepository) {
        this.vehicleDocumentRepository = vehicleDocumentRepository;
        this.driverDocumentRepository = driverDocumentRepository;
    }

    // ----- Documents vehicule -----

    @Transactional
    public VehicleDocumentEntity createVehicleDocument(VehicleDocumentEntity doc) {
        return vehicleDocumentRepository.save(doc);
    }

    public List<VehicleDocumentEntity> vehicleDocuments(UUID vehicleId) {
        return vehicleId != null
                ? vehicleDocumentRepository.findByVehicleIdAndDeletedFalse(vehicleId)
                : vehicleDocumentRepository.findByDeletedFalse();
    }

    @Transactional
    public void deleteVehicleDocument(UUID id) {
        VehicleDocumentEntity d = vehicleDocumentRepository.findById(id)
                .orElseThrow(() -> DocumentException.notFound(id));
        d.setDeleted(true);
        vehicleDocumentRepository.save(d);
    }

    // ----- Documents chauffeur -----

    @Transactional
    public DriverDocumentEntity createDriverDocument(DriverDocumentEntity doc) {
        return driverDocumentRepository.save(doc);
    }

    public List<DriverDocumentEntity> driverDocuments(UUID driverId) {
        return driverId != null
                ? driverDocumentRepository.findByDriverIdAndDeletedFalse(driverId)
                : driverDocumentRepository.findByDeletedFalse();
    }

    @Transactional
    public void deleteDriverDocument(UUID id) {
        DriverDocumentEntity d = driverDocumentRepository.findById(id)
                .orElseThrow(() -> DocumentException.notFound(id));
        d.setDeleted(true);
        driverDocumentRepository.save(d);
    }
}

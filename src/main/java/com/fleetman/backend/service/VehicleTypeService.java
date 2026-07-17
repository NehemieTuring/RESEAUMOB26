package com.fleetman.backend.service;

import com.fleetman.backend.entity.VehicleTypeEntity;
import com.fleetman.backend.exception.VehicleException;
import com.fleetman.backend.repository.VehicleTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class VehicleTypeService {

    private final VehicleTypeRepository vehicleTypeRepository;

    public VehicleTypeService(VehicleTypeRepository vehicleTypeRepository) {
        this.vehicleTypeRepository = vehicleTypeRepository;
    }

    public List<VehicleTypeEntity> list() {
        return vehicleTypeRepository.findAll();
    }

    @Transactional
    public VehicleTypeEntity create(VehicleTypeEntity type) {
        return vehicleTypeRepository.save(type);
    }

    public VehicleTypeEntity get(UUID id) {
        return vehicleTypeRepository.findById(id).orElseThrow(VehicleException::invalidVehicleType);
    }

    @Transactional
    public void delete(UUID id) {
        vehicleTypeRepository.deleteById(id);
    }
}

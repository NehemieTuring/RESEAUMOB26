package com.fleetman.backend.service;

import com.fleetman.backend.controller.dto.LookupResponse;
import com.fleetman.backend.controller.dto.VehicleDetailResponse;
import com.fleetman.backend.controller.dto.VehicleRequest;
import com.fleetman.backend.entity.*;
import com.fleetman.backend.exception.VehicleException;
import com.fleetman.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.function.Function;

/** Gestion locale des vehicules (remplace le service distant Pynfi). */
@Service
public class InternalVehicleService {

    private final VehicleRepository vehicleRepository;
    private final OperationalParameterRepository operationalRepository;
    private final FinancialParameterRepository financialRepository;
    private final MaintenanceParameterRepository maintenanceRepository;
    private final VehicleIllustrationImageRepository imageRepository;
    private final BrandRepository brandRepository;
    private final VehicleModelRepository modelRepository;
    private final FuelTypeRepository fuelTypeRepository;
    private final TransmissionTypeRepository transmissionTypeRepository;
    private final VehicleColorRepository colorRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final VehicleSizeRepository sizeRepository;
    private final UsageTypeRepository usageTypeRepository;

    public InternalVehicleService(VehicleRepository vehicleRepository,
                                  OperationalParameterRepository operationalRepository,
                                  FinancialParameterRepository financialRepository,
                                  MaintenanceParameterRepository maintenanceRepository,
                                  VehicleIllustrationImageRepository imageRepository,
                                  BrandRepository brandRepository,
                                  VehicleModelRepository modelRepository,
                                  FuelTypeRepository fuelTypeRepository,
                                  TransmissionTypeRepository transmissionTypeRepository,
                                  VehicleColorRepository colorRepository,
                                  VehicleTypeRepository vehicleTypeRepository,
                                  ManufacturerRepository manufacturerRepository,
                                  VehicleSizeRepository sizeRepository,
                                  UsageTypeRepository usageTypeRepository) {
        this.vehicleRepository = vehicleRepository;
        this.operationalRepository = operationalRepository;
        this.financialRepository = financialRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.imageRepository = imageRepository;
        this.brandRepository = brandRepository;
        this.modelRepository = modelRepository;
        this.fuelTypeRepository = fuelTypeRepository;
        this.transmissionTypeRepository = transmissionTypeRepository;
        this.colorRepository = colorRepository;
        this.vehicleTypeRepository = vehicleTypeRepository;
        this.manufacturerRepository = manufacturerRepository;
        this.sizeRepository = sizeRepository;
        this.usageTypeRepository = usageTypeRepository;
    }

    @Transactional
    public VehicleEntity createVehicle(VehicleRequest req, UUID managerId) {
        if (vehicleRepository.existsByLicensePlate(req.licensePlate())) {
            throw VehicleException.plateConflict(req.licensePlate());
        }
        VehicleEntity vehicle = VehicleEntity.builder()
                .managerId(managerId)
                .vehicleTypeId(req.vehicleTypeId())
                .licensePlate(req.licensePlate())
                .brand(labelOf(brandRepository::findById, req.brandId()))
                .model(labelOf(modelRepository::findById, req.modelId()))
                .manufacturingYear(req.manufacturingYear())
                .fuelType(labelOf(fuelTypeRepository::findById, req.fuelTypeId()))
                .transmissionType(labelOf(transmissionTypeRepository::findById, req.transmissionTypeId()))
                .tankCapacity(req.tankCapacity())
                .totalSeatNumber(req.totalSeatNumber())
                .averageFuelConsumption(req.averageFuelConsumption())
                .color(labelOf(colorRepository::findById, req.colorId()))
                .status("AVAILABLE")
                .deleted(false)
                .build();
        vehicle = vehicleRepository.save(vehicle);

        // Initialisation des 3 sous-tables de parametres
        operationalRepository.save(OperationalParameterEntity.builder()
                .vehicleId(vehicle.getId()).status(true).build());
        financialRepository.save(FinancialParameterEntity.builder()
                .vehicleId(vehicle.getId()).build());
        maintenanceRepository.save(MaintenanceParameterEntity.builder()
                .vehicleId(vehicle.getId()).engineStatus("OK").maintenanceStatus("UP_TO_DATE").build());
        return vehicle;
    }

    @Transactional
    public VehicleEntity updateVehicle(UUID vehicleId, VehicleRequest req) {
        VehicleEntity v = getActive(vehicleId);
        if (req.licensePlate() != null && !req.licensePlate().equals(v.getLicensePlate())) {
            if (vehicleRepository.existsByLicensePlate(req.licensePlate())) {
                throw VehicleException.plateConflict(req.licensePlate());
            }
            v.setLicensePlate(req.licensePlate());
        }
        if (req.vehicleTypeId() != null) v.setVehicleTypeId(req.vehicleTypeId());
        if (req.brandId() != null) v.setBrand(labelOf(brandRepository::findById, req.brandId()));
        if (req.modelId() != null) v.setModel(labelOf(modelRepository::findById, req.modelId()));
        if (req.manufacturingYear() != null) v.setManufacturingYear(req.manufacturingYear());
        if (req.fuelTypeId() != null) v.setFuelType(labelOf(fuelTypeRepository::findById, req.fuelTypeId()));
        if (req.transmissionTypeId() != null) v.setTransmissionType(labelOf(transmissionTypeRepository::findById, req.transmissionTypeId()));
        if (req.tankCapacity() != null) v.setTankCapacity(req.tankCapacity());
        if (req.totalSeatNumber() != null) v.setTotalSeatNumber(req.totalSeatNumber());
        if (req.averageFuelConsumption() != null) v.setAverageFuelConsumption(req.averageFuelConsumption());
        if (req.colorId() != null) v.setColor(labelOf(colorRepository::findById, req.colorId()));
        return vehicleRepository.save(v);
    }

    @Transactional
    public VehicleEntity patchVehicle(UUID vehicleId, Map<String, Object> updates) {
        VehicleEntity v = getActive(vehicleId);
        updates.forEach((k, val) -> {
            switch (k) {
                case "licensePlate" -> v.setLicensePlate((String) val);
                case "brand" -> v.setBrand((String) val);
                case "model" -> v.setModel((String) val);
                case "status" -> v.setStatus((String) val);
                case "color" -> v.setColor((String) val);
                case "photoUrl" -> v.setPhotoUrl((String) val);
                case "fleetId" -> v.setFleetId(val == null ? null : UUID.fromString(val.toString()));
                default -> { }
            }
        });
        return vehicleRepository.save(v);
    }

    @Transactional
    public void deleteVehicle(UUID vehicleId) {
        VehicleEntity v = getActive(vehicleId);
        v.setDeleted(true);
        v.setDeletedAt(Instant.now());
        vehicleRepository.save(v);
    }

    public VehicleDetailResponse getVehicleDetails(UUID vehicleId) {
        VehicleEntity v = getActive(vehicleId);
        return new VehicleDetailResponse(
                v,
                operationalRepository.findByVehicleId(vehicleId).orElse(null),
                financialRepository.findByVehicleId(vehicleId).orElse(null),
                maintenanceRepository.findByVehicleId(vehicleId).orElse(null),
                imageRepository.findByVehicleId(vehicleId));
    }

    public List<VehicleEntity> getVehicles(UUID managerId, boolean isAdmin) {
        return isAdmin ? vehicleRepository.findByDeletedFalse()
                : vehicleRepository.findByManagerIdAndDeletedFalse(managerId);
    }

    public VehicleEntity getActive(UUID vehicleId) {
        VehicleEntity v = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> VehicleException.notFound(vehicleId));
        if (v.isDeleted()) throw VehicleException.notFound(vehicleId);
        return v;
    }

    // ----- Referentiels -----

    public List<LookupResponse> getLocalLookupData(String resource) {
        return switch (resource) {
            case "vehicle-types" -> map(vehicleTypeRepository.findAll());
            case "manufacturers" -> map(manufacturerRepository.findAll());
            case "brands" -> map(brandRepository.findAll());
            case "models" -> map(modelRepository.findAll());
            case "sizes" -> map(sizeRepository.findAll());
            case "usages" -> map(usageTypeRepository.findAll());
            case "fuel-types" -> map(fuelTypeRepository.findAll());
            case "transmissions" -> map(transmissionTypeRepository.findAll());
            case "colors" -> map(colorRepository.findAll());
            default -> throw VehicleException.invalidVehicleType();
        };
    }

    public Map<String, List<LookupResponse>> getAllResourcesCatalog() {
        Map<String, List<LookupResponse>> all = new LinkedHashMap<>();
        all.put("vehicleTypes", map(vehicleTypeRepository.findAll()));
        all.put("manufacturers", map(manufacturerRepository.findAll()));
        all.put("brands", map(brandRepository.findAll()));
        all.put("models", map(modelRepository.findAll()));
        all.put("sizes", map(sizeRepository.findAll()));
        all.put("usages", map(usageTypeRepository.findAll()));
        all.put("fuelTypes", map(fuelTypeRepository.findAll()));
        all.put("transmissions", map(transmissionTypeRepository.findAll()));
        all.put("colors", map(colorRepository.findAll()));
        return all;
    }

    private List<LookupResponse> map(List<? extends LookupEntity> list) {
        return list.stream()
                .map(l -> new LookupResponse(l.getId(), l.getCode(), l.getLabel(), l.getDescription()))
                .toList();
    }

    private <T extends LookupEntity> String labelOf(Function<UUID, Optional<T>> finder, UUID id) {
        if (id == null) return null;
        return finder.apply(id).map(LookupEntity::getLabel).orElse(null);
    }
}

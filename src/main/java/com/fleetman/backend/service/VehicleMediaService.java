package com.fleetman.backend.service;

import com.fleetman.backend.entity.VehicleIllustrationImageEntity;
import com.fleetman.backend.repository.VehicleIllustrationImageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
public class VehicleMediaService {

    private final VehicleIllustrationImageRepository imageRepository;
    private final FileStorageService fileStorageService;

    public VehicleMediaService(VehicleIllustrationImageRepository imageRepository,
                               FileStorageService fileStorageService) {
        this.imageRepository = imageRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<VehicleIllustrationImageEntity> list(UUID vehicleId) {
        return imageRepository.findByVehicleId(vehicleId);
    }

    @Transactional
    public VehicleIllustrationImageEntity addImage(UUID vehicleId, MultipartFile file) {
        String path = fileStorageService.store(file, vehicleId, "VEHICLE", "GALLERY");
        return imageRepository.save(VehicleIllustrationImageEntity.builder()
                .vehicleId(vehicleId).imagePath(path).build());
    }

    @Transactional
    public void deleteImage(UUID imageId) {
        imageRepository.deleteById(imageId);
    }
}

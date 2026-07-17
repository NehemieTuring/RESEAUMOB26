package com.fleetman.backend.service;

import com.fleetman.backend.entity.StoredFileEntity;
import com.fleetman.backend.repository.StoredFileRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final StoredFileRepository storedFileRepository;
    private final Path uploadRoot;

    public FileStorageService(StoredFileRepository storedFileRepository,
                              @Value("${app.file-storage.upload-dir:./uploads}") String uploadDir) {
        this.storedFileRepository = storedFileRepository;
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadRoot);
        } catch (IOException e) {
            throw new IllegalStateException("Impossible de creer le repertoire d'upload", e);
        }
    }

    /** Stocke le fichier sur disque + trace en BDD. Retourne l'URL relative servable. */
    public String store(MultipartFile file, UUID ownerId, String ownerType, String fileType) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Fichier vide.");
        }
        String original = Path.of(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename())
                .getFileName().toString();
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.')) : "";
        String storedName = UUID.randomUUID() + ext;
        Path target = uploadRoot.resolve(storedName);
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Echec de l'ecriture du fichier", e);
        }
        StoredFileEntity entity = StoredFileEntity.builder()
                .ownerId(ownerId).ownerType(ownerType).fileType(fileType)
                .originalName(original).storedPath(storedName)
                .contentType(file.getContentType()).sizeBytes(file.getSize())
                .build();
        storedFileRepository.save(entity);
        return "/api/v1/files/" + storedName;
    }

    public byte[] load(String storedName) {
        try {
            return Files.readAllBytes(uploadRoot.resolve(storedName));
        } catch (IOException e) {
            throw new IllegalArgumentException("Fichier introuvable : " + storedName);
        }
    }

    public List<StoredFileEntity> listByOwner(UUID ownerId) {
        return storedFileRepository.findByOwnerId(ownerId);
    }
}
